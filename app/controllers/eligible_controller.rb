# This call can take a couple of seconds due to the fact that Eligible calls other stsytems in an hierarchy

class EligibleController < ApplicationController


  skip_before_filter :json_verify_authenticity_token
  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end

  require "eligible"
  require "json"
  # Retrieves the last data returned from the EligibleAPI
  #
  # [Required field :]
  #    * NONE
  # [Optional field]
  #    * NONE
  #
  # Called from the Route : +retrieve_eligible+ | GET | /eligible/retrieve | eligible#retrieve
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Charge Object
  #   on error from stripe returns the Stripe error@
  def show
    eligible = PatientInsuranceEligibility.find(params[:id])
    respond_to do |format|
      format.html {render action: dashboards}
      format.json {render json:{ status: 200, data: eligible  }}
    end
  end

  def retrieve ## This is to display the current eligibility results
    getProfile## requirements is the patient_id

    patient_id = @profile.patient_id

    begin
      eligible = PatientInsuranceEligibility.where("patient_id = ?", patient_id).order("created_at DESC").first!
      #puts $!.to_s
    rescue ActiveRecord::RecordNotFound => e
      puts "Record not found"
      respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json:{ status: 403, message: e.message } and return}
      end
    end
    respond_to do |format|
      format.html {render action: dashboards}
      format.json {render json:{ status: 200, data: eligible  }}
    end
  end

  ## To determine coverage We need the therapist Id and The patients insurance ID
  # Verifies the patients insurance and calculates the patient payment amount
  #
  # [Required field :]
  #    * :therapist_id
  #    * :patient_insurance_id
  #    * :fee_amount
  # [Optional field]
  #    * NONE
  #
  # Called from the Route : +coverage_eligible+ | POST | /eligible/coverage | eligible#coverage
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json active_coverage: patient_amount: message:
  #   on error from stripe returns the Stripe error
  def coverage
    getProfile
    # the following 2 lines will be remove and placed in the other file
    # Eligible.api_key = 'CsZxrqJWChZGvrLdoOSyt3gEDvg5gOyP95La'
    # Eligible.test = true
    Eligible.api_key = 'Him9fbPVZ1Nu0-nZNARIjNxLLGqujPnuCo2j' #live
    Eligible.test = false

    patient_id = @profile.patient_id
    therapist_id = params[:therapist_id]

    #get the patient Insurance information
    begin
     pat_ins = PatientInsurance.find(params[:patient_insurance_id])
    rescue ActiveRecord::RecordNotFound
      format.json {render json:{ status: 412, error: "No Insurance found" } and return}
      #break
    end
    # Determine if the Therapist accept the insurance from the patient
#=begin
    if !TherapistAcceptInsurance.exists?(
      {entity_id: therapist_id,
      insurance_payer_id: pat_ins[:insurance_payer_id]})
      respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: { status: 200, active_coverage: false, payment_amount: params[:fee_amount], message: "Therapist not in Network"} and return}
      end
      return
    end
#=end
    # Get the therapist NPI, LastName and FirstName
    #
    therapist = Therapist.find(therapist_id)
  # See if the therapist is a licensed Psychologist.
    if TherapistLicense.exists?({therapist_id: therapist_id, license_type: ['MD', 'APNP']})
      service_type = "A8"
    else
      service_type = "A6"
    end

    deduct_family = 0
    deduct_individual = 0
    percentage = 0
    copayment = 0

    coverage = call_eligible(pat_ins, therapist, service_type)
    #coverage.to_hash # returns all coverage info for the request

    # Check for error
    if !coverage.error.nil?
      #puts coverage.error
      respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: { status: 404, error: coverage.error}}
      end
      return # return error, if any
    end
    puts "######This is the first call###############################################################"

    #puts coverage[:services].inspect
    coverage[:services].each do |serv|
      #puts serv[:type].inspect
      if serv[:type] == service_type
        if serv[:coverage_status] == "1"  or serv[:coverage_status] == "true"     #active_coverage = serv[:coverage_status] = "true" ? "true" : "false"
          active_coverage = true
        else
          active_coverage = false
          respond_to do |format|
            format.html {render action: dashboards}
            format.json {render json: { active_coverage: active_coverage, patient_amount: params[:fee_amount]}}
          end
          return
        end

        if !serv[:financials].blank?   ## Financials can be blank then no processing
          #process deductibles
          if !(serv[:financials][:deductible].blank? or serv[:financials][:deductible][:remainings].blank? or serv[:financials][:deductible][:remainings][:in_network].blank?)

            serv[:financials][:deductible][:remainings][:in_network].each do |ded|
              case ded[:level]
                when "FAMILY"
                  if ded[:amount].to_i > deduct_family
                    deduct_family = ded[:amount].to_i
                  end
                when "INDIVIDUAL"
                  if ded[:amount].to_I > deduct_individual
                    deduct_individual = ded[:amount].to_i
                  end
                end
            end
          else
            puts "no deductible data"
            deduct_family = nil
            deduct_individual = nil
          end
          #process coinsurance
          if !(serv[:financials][:coinsurance].blank? or serv[:financials][:coinsurance][:percents].blank? or serv[:financials][:coinsurance][:percents][:in_network].blank?)
            #puts serv[:financials][:coinsurance][:percents][:in_network]
            serv[:financials][:coinsurance][:percents][:in_network].each do |perc|
              if perc[:percent].to_i > percentage
                    percentage = perc[:percent].to_i
              end
            end
          else
            puts "no coinsurance data"
            percentage = nil
          end
#=begin          #process copayments
          if !(serv[:financials][:copayment].blank? or serv[:financials][:copayment][:amounts].blank? or serv[:financials][:copayment].blank? or serv[:financials][:copayment][:amounts][:in_network].blank?)
            puts serv[:financials][:copayment][:amounts]
            serv[:financials][:copayment][:amounts][:in_network].each do |cop|
              if cop[:amount].to_i > copayment
                copayment = cop[:amount].to_i
              end
            end
          else
            puts "no copayment data"
            copayment = nil
          end
#=end

        else
          puts "no financial data"
          deduct_family = nil
          deduct_individual = nil
          percentage = nil
          copayment = nil
        end
      end
    end
    puts "***********Amounts***********************"
    puts deduct_family.inspect
    puts deduct_individual.inspect
    puts percentage.inspect
    puts copayment.inspect
    #coverage[:primary_insurance][:service_providers][:physicians].each do |phy|
    #  puts phy[:insurance_type]
    #end
    #wrk_coverage = JSON.parse(coverage)
    #puts wrk_coverage.keys
    # Create response of insurence eligibility
    # update or create the patient insurance eligibility
    ins_elig = PatientInsuranceEligibility.find_or_initialize_by(patient_id: patient_id)
    ins_elig.created_at        = coverage[:created_at]
    ins_elig.eligible_id       = coverage[:eligible_id]
    ins_elig.demographics      = coverage[:demographics].to_s
    ins_elig.primary_insurance = coverage[:primary_insurance].to_s
    ins_elig.plan              = coverage[:plan].to_s
    ins_elig.services          = coverage[:services].to_s

    ### Check if we need to do a second eligibility call
    if deduct_family.nil? or deduct_individual.nil? or percentage.nil? or copayment.nil?

      service_type = "30"
      coverage = call_eligible(pat_ins, therapist, service_type)

      # Check for error
      if !coverage.error.nil?
        #puts coverage.error
        respond_to do |format|
          format.html {render action: dashboards}
          format.json {render json: { status: 404, error: coverage.error}}
        end
        return # return error, if any
      end

      #ins_elig.created_at        = coverage[:created_at]
      #ins_elig.eligible_id2       = coverage[:eligible_id]
      ins_elig.demographics_2      = coverage[:demographics].to_s
      ins_elig.primary_insurance_2 = coverage[:primary_insurance].to_s
      ins_elig.plan_2              = coverage[:plan].to_s
      ins_elig.services_2          = coverage[:services].to_s
      puts "#This is the 2nd call##################################################"

      #puts coverage[:services].inspect
      coverage[:services].each do |serv|
      puts serv[:type].inspect
      if serv[:type] == "98"
        if serv[:coverage_status] == "1"  or serv[:coverage_status] == "true"     #active_coverage = serv[:coverage_status] = "true" ? "true" : "false"
          active_coverage = true
        else
          active_coverage = false
        end

        if !serv[:financials].blank?   ## Financials can be blank then no processing
          #process deductibles
          if deduct_family.nil? and deduct_individual.nil?
            deduct_family = 0
            deduct_individual = 0
            if !(serv[:financials][:deductible].blank? or serv[:financials][:deductible][:remainings].blank? or serv[:financials][:deductible][:remainings][:in_network].blank?)
              #process deductibles
              serv[:financials][:deductible][:remainings][:in_network].each do |ded|
                case ded[:level]
                  when "FAMILY"
                    if ded[:amount] > deduct_family
                      deduct_family = ded[:amount]
                    end
                  when "INDIVIDUAL"
                    if ded[:amount] > deduct_individual
                      deduct_individual = ded[:amount]
                    end
                  end
              end
            else
              puts "no 2nd deductible data"
              deduct_family = nil
              deduct_individual = nil
            end
          end
          #process coinsurance
          if percentage.nil?
            percentage = 0
            if !(serv[:financials][:coinsurance].blank? or serv[:financials][:coinsurance][:percents].blank? or serv[:financials][:coinsurance][:percents][:in_network].blank?)
              puts "current trace"
              puts serv[:financials][:coinsurance][:percents][:in_network]
              serv[:financials][:coinsurance][:percents][:in_network].each do |perc|
                if perc[:percent].to_i > percentage
                  percentage = perc[:percent].to_i
                end
              end
            else
              puts "no 2nd coinsurance data"
              percentage = nil
            end
          end
          #process copayments
          if copayment.nil?
            copayment = 0
            if !(serv[:financials][:copayment].blank? or serv[:financials][:copayment][:amounts].blank? or serv[:financials][:copayment].blank? or serv[:financials][:copayment][:amounts][:in_network].blank?)
              #puts serv[:financials][:copayment][:amounts]
              serv[:financials][:copayment][:amounts][:in_network].each do |cop|
                if cop[:amount].to_i > copayment
                  copayment = cop[:amount].to_i
                end
              end
            else
              puts "no 2nd copayments data"
              copayment = nil
            end
          end
        else
          puts "no 2nd financial data"
        end
      end
    end
    puts "*********2nd Amounts***********************"
    puts deduct_family
    puts deduct_individual
    puts percentage
    puts copayment
    puts "############this is the Plan check########################"
    ### Check if we have no values to use the plan Financials
    if (deduct_family.nil? and deduct_individual.nil?) or percentage.nil? or copayment.nil?
      if deduct_family.nil? and deduct_individual.nil?
        deduct_family = 0
        deduct_individual = 0
        if !(coverage[:plan][:financials][:deductible].blank? or coverage[:plan][:financials][:deductible][:remainings].blank? or coverage[:plan][:financials][:deductible][:remainings][:in_network].blank?)
          #process deductibles
          coverage[:plan][:financials][:deductible][:remainings][:in_network].each do |ded|
            case ded[:level]
            when "FAMILY"
              if ded[:amount].to_i > deduct_family
                deduct_family = ded[:amount].to_i
              end
            when "INDIVIDUAL"
              if ded[:amount].to_i > deduct_individual
                deduct_individual = ded[:amount].to_i
              end
            end
          end
        else
          puts "no Plan deductible data"
          deduct_family = nil
          deduct_individual = nil
        end
      end
        #process coinsurance
      if percentage.nil?
        percentage = 0
        if !(coverage[:plan][:financials][:coinsurance].blank? or coverage[:plan][:financials][:coinsurance][:percents].blank? or coverage[:plan][:financials][:coinsurance][:percents][:in_network].blank?)
          #puts serv[:financials][:coinsurance][:percents][:in_network]
          coverage[:plan][:financials][:coinsurance][:percents][:in_network].each do |perc|
            if perc[:percent].to_i > percentage
              percentage = perc[:percent].to_i
            end
          end
        else
          puts "no plan coinsurance data"
          percentage = nil
        end
      end
      #process copayments
      if copayment.nil?
        copayment = 0
        if !(coverage[:plan][:financials][:copayment].blank? or coverage[:plan][:financials][:copayment][:amounts].blank? or coverage[:plan][:financials][:copayment].blank? or coverage[:plan][:financials][:copayment][:amounts][:in_network].blank?)
          #puts serv[:financials][:copayment][:amounts]
          serv[:financials][:copayment][:amounts][:in_network].each do |cop|
            if cop[:amount].to_i > copayment
              copayment = cop[:amount].to_i
            end
          end
        else
          puts "no Plan copayments data"
          copayment = nil
        end
      end
    end
    end

    puts "*********3rd Amounts***********************"
    puts deduct_family
    puts deduct_individual
    puts percentage
    puts copayment


    ## save Patient Insurance eligibility
    ins_elig.created_at        = coverage[:created_at]
    ins_elig.eligible_id       = coverage[:eligible_id]
    ins_elig.demographics      = coverage[:demographics].to_s
    ins_elig.primary_insurance = coverage[:primary_insurance].to_s
    ins_elig.plan              = coverage[:plan].to_s
    ins_elig.services          = coverage[:services].to_s

    ## save Patient Insurance eligibility
    ins_elig.save
    #puts "******work Coverage"
    if deduct_family.nil? and deduct_individual.nil? and percentage.nil? and copayment.nil?
      patient_amount = params[:fee_amount]
    else
      deduct_family = deduct_family.nil? ? 0 : deduct_family
      deduct_individual = deduct_individual.nil? ? 0 : deduct_individual
      if deduct_family > deduct_individual
        deductible = deduct_individual
      else
        deductible = deduct_family
      end
      puts '--------------------------------'
      puts deductible
      puts '----------------------'
      if deductible > params[:fee_amount].to_f
        patient_amount = deductible
      else
        if !copayment.nil?
          if deductible > copayment
            patient_amount = deductible
          else
            patient_amount = copayment
          end
        end
        if !percentage.nil?
          if deductible > (params[:fee_amount].to_f * percentage)
            patient_amount = deductible
          else
            patient_amount = params[:fee_amount].to_f * percentage
          end
        end
      end
    end

    # May want to render less thhn the full coverage response

    respond_to do |format|
      format.html {render action: dashboards}
      format.json {render json: {active_coverage: true, patient_amount: patient_amount, patient_ins_eligibity: ins_elig.id, message: " "}}
    end
  end

 private
  def call_eligible(pat_ins, therapist, service_type)

    pat_ins_payer = InsurancePayersName.find(pat_ins[:insurance_payer_id])
    # Setup the parameters  for the coverage call  ]
    eparams = {
      :service_type => service_type,
      :network => "IN",
      :payer_id   => pat_ins_payer[:payers_id],
      :provider_last_name => therapist[:last_name],
      :provider_first_name => therapist[:first_name],
      :provider_npi => therapist[:npi_no].to_s.rjust(10, '0'),
      :member_id =>  pat_ins[:subscriber_id],                       #### use for teting"U12121212",
      :member_last_name => pat_ins[:subscriber_last_name],          ##"Austen",
      :member_first_name => pat_ins[:subscriber_first_name],        ##"Jane",
      :member_dob => pat_ins[:subscriber_dob].strftime('%Y-%m-%d')  ## "1955-12-14"
    }
    if pat_ins[:subscriber_relationship] != 'self'
      eparams.merge(:dependant_last_name  => pat_ins[:dependant_last_name],
      :dependant_first_name => pat_ins[:dependant_first_name],
      :dependant_dob        => pat_ins[:dependant_dob])
    end

    coverage = Eligible::Coverage.get(eparams)

  end

  def getProfile
    @user = current_user
    @profile = @user.getProfileable
  end

 end
