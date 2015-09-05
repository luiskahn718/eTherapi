##
# Appointment Controller.
# This controller is responsible for the managememt of all appoint functions
#
# [Ability Configuration]
# * Therapist can
#   1. :index
#   2. :show
#   3. :update
#   4. :create
#   5. :pending
#   6. :accept
#   7. :decline
#   8. :destroy
#
# * Patient can
#   1. :index
#   2. :show
#   3. :update
#   4. :create
#   5. :pending
#   6. :accept
#   7. :decline
#
class AppointmentsController < ApplicationController

  require "stripe"

  skip_before_filter  :json_verify_authenticity_token

  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end
  # Before precess filters
  before_filter :authenticate_user!

  before_filter :add_list_patient_to_gon, :only => [:show, :new, :index, :edit ]

  authorize_resource :class => false

  STATUS = {
    "d" => "declined",
    "c" => "accepted",
    "x" => "deleted",
    "p" => "pending"
  }

  ##
  # Show the detail of a specific appointment
  #
  # Called from the Route : +appointment+ | GET | /appointments/:id(.:format) | appointments#show
  #
  # Calls template : views/appointments/show.html.haml
  #
  # [Returns]
  #   * @appointment
  #   * @owner
  #   * @patient
  #   * @therapist
  #
  def show
    getProfile
    @appointment = Appointment.find(params[:id])
    @owner = User.find(@appointment.owner_id)
    if !@appointment.patient_id.blank?
      @patient = Patient.find(@appointment.patient_id)
    end
    @therapist = Therapist.find(@appointment.therapist_id)
  end

  ##
  # Create a New appointment
  #
  # Called from the Route : +new_appointment+ | GET | /appointments/new(.:format) | appointments#new
  #
  # Calls template : views/appointments/new.html.haml
  #
  # [Returns]
  #    * @appointment
  #    * @sessiont_type
  #    * @therapist
  #
  #  [JSON parameter format]
  #     {"therapist_id":"2"}
  #
  def new
    getProfile
    therapist_id = params[:therapist_id]

    if @user.is_therapist?
    therapist_id = @profile.therapist_id
    end

    if @user.is_patient? && therapist_id.blank?
      respond_to do |format|
        format.html { render action: 'new', danger: "A therapist must be selected to request an appointment. Please select a therapist."}
        format.json { render json:  { :errors => "A therapist must be selected to request an appointment. Please select a therapist." }, status: 409 }
      end
    return
    end

    @therapist = Therapist.find(therapist_id)
    @appointment = Appointment.new
    @appointment.therapist_id = therapist_id
    @session_type = Array.new
    @session_type.push ['c','Couple']
    @session_type.push ['s','Single']
    if @user.is_therapist?
      @session_type.push ['g','Group']
      @session_type.push ['b','Blocked']
    end
    respond_to do |format|
    # format.html { redirect_to @appointment}
      format.html { render action: 'new'}
      format.json { render :status => 200, :json => { action: :new, appointment: @appointment,
                                                                    therapist: @therapist,
                                                                    session_type: @session_type}}
    end
  end

  ##
  # List all +Confirmed+ appointments for the currently logged in user
  #
  # Called from the Route : +appointments+ | GET | /appointments(.:format) | appointments#index
  #
  # Calls template : views/appointments/index.html.haml
  #
  # [Returns]
  #    * @appointment
  #    * @request_appointments
  #    * @past_or_cancel_appointments
  #    * @upcomming_appointments
  #    * @user - User Model
  #    * @profile - Patient or Therapist Profile based on the User type
  #

  def index
    getProfile

    # get upcomming appointments
    today = Time.now
    current_day = today.strftime('%Y-%m-%d')
    current_time = today.strftime('%T')

    if @user.is_patient?
      @upcomming_appointments = Appointment.patient_up_coming(@user.id, @profile.id, current_day, current_time).recents
      @request_appointments = Appointment.patient_request(@user.id, @profile.id, current_day, current_time).recents
      @past_or_cancel_appointments = Appointment.patient_past_or_cancel(@user.id, @profile.id, current_day, current_time).recents
      @appointments = Appointment.patient_all_confirmed(@user.id, @profile.id).recents
      @decline_appointment = Appointment.patient_declined(@user.id, @profile.id).recents
    else
      @upcomming_appointments = Appointment.therapist_up_coming(@user.id, @profile.id, current_day, current_time).recents
      @request_appointments = Appointment.therapist_request(@user.id, @profile.id, current_day, current_time).recents
      @past_or_cancel_appointments = Appointment.therapist_past_or_cancel(@user.id, @profile.id, current_day, current_time).recents
      @appointments = Appointment.therapist_all_confirmed(@user.id, @profile.id).recents
      @decline_appointment = Appointment.therapist_declined(@user.id, @profile.id).recents
    end

    # @appointments = Appointment.where(where, @user.id, @profile.id)

    # today = Time.now
    # current_day = today.strftime('%Y-%m-%d')
    # current_time = today.strftime('%T')

    # if @user.is_therapist?
    #   @upcomming_appointments = Appointment.therapist_up_comming(@user.id, @profile.id, current_day, current_day, current_time)
    #   @request_appointments = Appointment.therapist_request(@user.id, @profile.id, current_day, current_day, current_time)
    #   @past_or_cancel_appointments = Appointment.therapist_past_or_cancel(@user.id, @profile.id, current_day, current_day, current_time)
    # else
    #   @upcomming_appointments = Appointment.patient_up_comming(@user.id, @profile.id, current_day, current_day, current_time)
    #   @request_appointments = Appointment.patient_request(@user.id, @profile.id, current_day, current_day, current_time)
    #   @past_or_cancel_appointments = Appointment.patient_past_or_cancel(@user.id, @profile.id, current_day, current_day, current_time)
    # end

    @appointments = convert_model_to_hash(@appointments)
    @upcomming_appointments = convert_model_to_hash(@upcomming_appointments)
    @request_appointments = convert_model_to_hash(@request_appointments)
    @past_or_cancel_appointments = convert_model_to_hash(@past_or_cancel_appointments)

    #Push to gon
    gon.push({:user => current_user,
      :upcomming_appointments => @upcomming_appointments,
      :request_appointments => @request_appointments,
      :past_or_cancel_appointments => @past_or_cancel_appointments,
      :profile => @profile
    })

    respond_to do |format|
      format.html { render :layout => 'appointments' }
      format.json { render json: {:upcomming_appointments => @upcomming_appointments, :request_appointments => @request_appointments, :past_or_cancel_appointments => @past_or_cancel_appointments } }
    end
  end

  ##
  # List all +Pending+ appointments for the currently logged in user
  #
  # Called from the Route : +appointments+ | GET | /appointments(.:format) | appointments#index
  #
  # Calls template : views/appointments/pending.html.haml
  #
  # [Returns]
  #    * @appointment
  #    * @user - User Model
  #    * @profile - Patient or Therapist Profile based on the User type
  #
  def pending
    getProfile
    where = "status = 'p' and (owner_id = ? OR patient_id = ?)"
    if @user.is_therapist?
      where = "status = 'p' and (owner_id = ? OR therapist_id = ?)"
    end
    @appointments = Appointment.where(where, @user.id, @profile.id)
    respond_to do |format|
      format.html { render action: 'pending' }
      format.json { render :status => 200, :json => { action: 'pending', appointments: @appointments, user: @user, profile: @profile }}
    end
  end

  ##
  # Edit the selected Appointment
  #
  # [Required field :]
  #    * :id
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : views/appointments/edit.html.haml
  #
  # [Returns]
  #    * @appointment
  #    * @user - User Model
  #    * @profile - Patient or Therapist Profile based on the User type
  #    * @session_type - An Array of possible session types
  #         a. If the user is a +Patient+ the list of session type is : {['c','Couple'], ['s','Single']}
  #         b. If the user is a +Therapist+ the list of session type is : {['c','Couple'], ['s','Single'], ['g','Group'], ['b','Blocked']}
  #
  #
  def edit
    getProfile
    setAppointment
    @therapists = Therapist.all
    @patients = Patient.all
    #
    @session_type = Array.new
    @session_type.push ['c','Couple']
    @session_type.push ['s','Single']
    if @user.is_therapist?
      @session_type.push ['g','Group']
      @session_type.push ['b','Blocked']
    end

    #check cancel
    confirmed = true
    cancel_over_24 = false
    if @appointment.status == "x"
      confirmed = false
      cancel_at = @appointment.delete_date
      start_time = Time.new(@appointment.date.year, @appointment.date.month, @appointment.date.day, @appointment.start_time.hour, @appointment.start_time.min, @appointment.start_time.sec)
      if cancel_at.present?
        if ( ( start_time - cancel_at ) / (1.hour) ).round >= 24
          cancel_over_24 = true
        end
      end
    end
    # set to gon
    json_appointment = @appointment.serializable_hash
    p = Patient.find(json_appointment["patient_id"])
    json_appointment["patient_name"] = p.first_name + " " + p.last_name
    json_appointment["patient"] = p
    json_appointment["start_time"] = json_appointment["start_time"].strftime("%T")
    json_appointment["end_time"] =  json_appointment["end_time"].strftime("%T")

    ### add therapist to appointment for use in edit/ view appoinment in case user is patient
    t = Therapist.find(json_appointment["therapist_id"])
    json_appointment["therapist_name"] = t.first_name + " " + p.last_name
    json_appointment["therapist"] = t

    # insurance = PatientInsurance.find_by_patient_id(json_appointment["patient_id"])

    # json_appointment["patient_insurance"] = insurance
    if @appointment.canceled_by_id.present?
      json_appointment["canceled_by"] = User.find(@appointment.canceled_by_id).account_type
    else
      json_appointment["canceled_by"] = ""
    end

    # Here add an therapist consent to gon for use in appointment detail
    if current_user.is_therapist?
      gon.push({:therapist_consent => @profile.therapist_consent})
    end

    #### check this appointment is pass appointment or not. This case use in appointment detail
    #### If past appointment the view show differen with not past appointment
    past_appointment = false
    end_time = Time.new(@appointment.date.year, @appointment.date.month, @appointment.date.day, @appointment.end_time.hour, @appointment.end_time.min, @appointment.end_time.sec)
    if end_time < Time.now
    past_appointment = true
    end
    gon.push({:past_appointment => past_appointment})

    ##### get session_id and additional, progress note
    # get progress, additional notes and add it to go for show in view.
    session_ids = SessionLog.get_session_id_from_appointment(params[:id])
    if !session_ids.blank?
      session_id = session_ids.first
      progress_note = Note.session_notes(session_id).progress
      additional_note = Note.session_notes(session_id).additional
      gon.push({session_id: session_id,
        progress_note: progress_note,
        additional_note: additional_note
      })
      json_appointment["therapist_declared_duration"] = session_id.therapist_declared_duration
    end


    gon.push({:user => current_user, :appointment => json_appointment, :confirmed => confirmed, :cancel_over_24 => cancel_over_24, :profile => @profile })
    ### add icd10 and cpt code to gon for getting
    gon.push({
      icd10_cdes: Icd10Cde.all,
      cpt_cdes: CptCde.all
      })


    eligible = []
    ## get PatientInsuranceEligibility
    if @appointment.patient_ins_eligibility_id.present?
      if PatientInsuranceEligibility.find(@appointment.patient_ins_eligibility_id).present?
        eligible = PatientInsuranceEligibility.find(@appointment.patient_ins_eligibility_id)
      end
    end
    # coverage_verified
    coverage_verified = ""
    # Health insurance name
    health_insurance_name = ""
    # Insurance ID
    insurance_ID = ""
    # Plan Name
    plan_name = ""
    if eligible.present?
      coverage_verified =  eval(eligible.plan)[:coverage_status_label]
      health_insurance_name = eval(eligible.primary_insurance)[:name]
      insurance_ID =  eval(eligible.demographics)[:subscriber][:member_id] || eval(eligible.demographics)[:subscriber][:member_id]
      plan_name = eval(eligible.plan)[:plan_name]
    end

    ## add it in to gon
    gon.push({ eligible: eligible, coverage_verified: coverage_verified, health_insurance_name: health_insurance_name, insurance_ID: insurance_ID, plan_name: plan_name })
    ##### get preauthorize info or capture info

    # if @appointment.processed_amt.to_i <= 0
    #   charge_id = @appointment.pre_charge_id
    # else
    #   payment = Payment.find_by_appointment_id(@appointment.id)
    #   if payment.present?
    #     charge_id = payment.ref_no
    #   end
    # end

    if @appointment.pre_charge_id.present?
      charge_id = @appointment.pre_charge_id
    else
      payment = Payment.find_by_appointment_id(@appointment.id)
      if payment.present?
        charge_id = payment.ref_no
      end
    end

    ##### call Stripe api for get info of preautorize
    if charge_id.present?
      begin
      retrieve = Stripe::Charge.retrieve(charge_id)
      rescue Stripe::StripeError => e
        # Display a very generic error to the user, and maybe send
        # yourself an email
        body = e.json_body
        return render :json => {:success => false, :message => body[:error][:message]}
      else
        gon.push({ retrieve: retrieve })
      end
    end

    ## check appointment is processed or not
    appointment_processed = false
    if Payment.find_by_appointment_id(@appointment.id).present?
      appointment_processed = true
    end
    # add to gon
    gon.push({appointment_processed: appointment_processed})

    respond_to do |format|
      format.html { render :layout => 'main' }
      format.json { render json: {:appointment => json_appointment, :confirmed => confirmed, :cancel_over_24 => cancel_over_24, :past_appointment => past_appointment, eligible: eligible, coverage_verified: coverage_verified, health_insurance_name: health_insurance_name, insurance_ID: insurance_ID, plan_name: plan_name }}
    end
  end

  ##
  # Create a new Appointment
  #
  # [Required fields :]
  #   * :start_time
  #   * :end_time
  #   * :date
  #   * :user_ids - for futuer use
  #   * :session_type -
  #   * :therapist_id - the therapist_id from the therapist model
  #   * :patient_id - the patient_id from the patient model
  #   * :status - p:pending, c:confirmed, d:deleted
  #   * :owner_id - User_ID of the user creating the appointment
  #   * :note - Free text note attached to the appointment
  #   * :consent - Boolean true or false, must be true to save the appointment if a patient_id is present
  #
  # [Optional field :]
  #   * :stripe_token
  #   * :fee_amount
  #
  # Called from the Route : POST | /appointments(.:format) | appointments#create
  #
  # Calls template : Redirect to +appointment+
  #
  # [Returns]
  #    * @appointment - the created appointment
  #    * session_log - the created session_log tied to the appointment (Created only of a patient is present in the appointment)
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {"appointment":{"start_time":"13:00", "end_time":"15:00", "date":"2014-05-26", "session_type":"s", "therapist_id":"2", "patient_id":"3", "status":"p", "owner_id":"26", "note":"First REST Appointment", "consent":true}}
  #
  def create
    @appointment = Appointment.new(appointment_params)
    if @appointment.session_type =='b'
      @appointment.status = 'p'
    else
    #If the appointment is not a block from the therapist check for consent
      if params[:appointment][:consent].blank? || params[:appointment][:consent] == false
        respond_to do |format|
          format.html { render action: 'new', danger: "Consent must be accepted before booking an appointment."}
          format.json { render json:  { :errors => "Consent must be accepted before booking an appointment." }, status: 409 }
        end
      return
      end
    end
    respond_to do |format|
      if @appointment.save
        #Store the consent information and create the session
        if !@appointment.patient_id.blank?
          PatientConsent.acknownledge(@appointment.therapist_id, @appointment.patient_id, nil)
          session_log = SessionLog.new
          session_log.appointment_id = @appointment.id
          session_log.therapist_id = @appointment.therapist_id
          session_log.patient_id = @appointment.patient_id
          session_log.save
        end

        format.html { redirect_to @appointment, notice: 'Appointment was successfully created.' }
        format.json { render :status => 200, :json => { action: :created, appointment: @appointment, session: session_log}}
      else
        format.html { render action: 'new' }
        format.json { render json: @appointment.errors, status: :unprocessable_entity }
      end
    end
  end

  ##
  # Returns the session_id attached to the appointment
  #
  # [Required field :]
  #   * :id
  #
  # Called from the Route : get_session_log_appointment | GET | /appointments/:id/get_session_log(.:format) | appointments#get_session_log
  #
  # [Returns]
  #  * session_log as {session_log:+id+}
  #
  def get_session_log
    session_ids = SessionLog.get_session_id_from_appointment params[:id]
    if !session_ids.blank?
      session_id = session_ids.first
      respond_to do |format|
        format.json { render :status => 200, :json => { action: :get_session_log, session_log: session_id}}
      end
    else
      respond_to do |format|
        format.json { render status: :unprocessable_entity, :json => { action: :get_session_id, errors: 'Session_id not found'}}
      end
    end
  end

  ##
  # Update an existing appointment
  #
  # [Required field :]
  #   * :id
  #   * :start_time
  #   * :end_time
  #   * :date
  #   * :user_ids - for futuer use
  #   * :session_type -
  #   * :therapist_id - the therapist_id from the therapist model
  #   * :patient_id - the patient_id from the patient model
  #   * :status - p:pending, c:confirmed, x:deleted, d:declined
  #   * :owner_id - User_ID of the user creating the appointment
  #   * :note - Free text note attached to the appointment
  #   * :consent - Boolean true or false, must be true to save the appointment if a patient_id is present
  #
  # Called from the Route : PUT | /appointments/:id(.:format) | appointments#update
  #
  # Calls template : Redirect to +appointment+
  #
  # [Returns]
  #    * @appointment - the created appointment
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {"appointment":{"start_time":"13:00", "end_time":"15:00", "date":"2014-05-26", "session_type":"s", "therapist_id":"2", "patient_id":"3", "status":"p", "owner_id":"26", "note":"First REST Appointment", "consent":true}}
  #
  def update
    setAppointment

    if params[:session_type] == 'b'
      params[:status] == 'c'
    end
    if params[:appointment][:status] == "d"
      params[:appointment][:delete_date] = Time.now
    end

    # cacht appointment_status_before_update
    appointment_status_before_update = @appointment.status
    respond_to do |format|
      if @appointment.update(appointment_params)
        ## if "confirm"
        if params[:appointment][:status] == "c"
          #Create a relationship if it doesn't exist and there's a patient
          if !@appointment.patient_id.blank?
            therapist_user_id = Therapist.find(@appointment.therapist_id)
            patient_user_id = Patient.find(@appointment.patient_id)
            if !TherapistPatient.has_relation?(therapist_user_id.user_id, patient_user_id.user_id)
              relation = TherapistPatient.new
              relation.therapist_user_id = therapist_user_id.user_id
              relation.patient_user_id = patient_user_id.user_id
              relation.start_date = Time.now
              relation.accepted_on = Time.now
              relation.save
            end
          end
        elsif params[:appointment][:status] == "x" ### patient cancel update delete time
          sessions = SessionLog.get_session_id_from_appointment(@appointment.id)

          ## if the status from "p" to "x"
          if appointment_status_before_update == "p"
            # update the changed_fee_amt
            if !sessions.blank?
              session = sessions.first
              session.update_attributes(changed_fee_amt: 0)
            end
          else # check cancel is more than 24h
            #######
            cancel_over_24 = false
            cancel_at = Time.now
            start_time = Time.new(@appointment.date.year, @appointment.date.month, @appointment.date.day, @appointment.start_time.hour, @appointment.start_time.min, @appointment.start_time.sec)
            if cancel_at.present?
              if ( ( start_time - cancel_at ) / (1.hour) ).round >= 24
                cancel_over_24 = true
                ####### update the changed_fee_amt
                if !sessions.blank?
                  session = sessions.first
                  session.update_attributes(changed_fee_amt: 0)
                end
              end
            end
            #######
          end
          @appointment.update_attributes(delete_date: Time.now, canceled_by_id: current_user.user_id, canceled_datetime: Time.now)
        end
        format.html { redirect_to @appointment, notice: 'Appointment was successfully updated.' }
        format.json { render :status => 200, :json => { action: :updated, appointment: @appointment}}
      #format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @appointment.errors, status: :unprocessable_entity }
      end
    end

  end

  ##
  # Accept the appointment. This method will change the status of the appointment to 'c' - Confirmed
  #
  # [Required field :]
  #   * :id
  #
  # Called from the Route : accept_appointment | GET | /appointments/:id/accept(.:format) | appointments#accept
  #
  # Calls template : Redirect to +appointment+
  #
  # [Returns]
  #    * @appointment - the created appointment
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {}
  #
  def accept
    getProfile
    setAppointment
    @appointment.status = 'c'
    respond_to do |format|
      if @appointment.save
        #Create a relationship if it doesn't exist and there's a patient
        if !@appointment.patient_id.blank?
          therapist_user_id = Therapist.find(@appointment.therapist_id)
          patient_user_id = Patient.find(@appointment.patient_id)
          if !TherapistPatient.has_relation?(therapist_user_id.user_id, patient_user_id.user_id)
            relation = TherapistPatient.new
            relation.therapist_user_id = therapist_user_id.user_id
            relation.patient_user_id = patient_user_id.user_id
            relation.start_date = Time.now
            relation.accepted_on = Time.now
          relation.save
          end
        end

        #Inform the Owner that the appointment was accepted
        email_owner('appointment_accepted', @appointment)

        format.html { redirect_to @appointment, notice: 'Appointment was successfully accepted.' }
        format.json { render :status => 200, :json => { action: :accepted, appointment: @appointment}}
      else
        format.html { render action: 'edit' }
        format.json { render json: @appointment.errors, status: :unprocessable_entity }
      end
    end
  end

  ##
  # Deletes the appointment - This method will change the status of the appointment to 'x' - Deleted
  #
  # [Required field :]
  #   * :id
  #
  # Called from the Route : DELETE | /appointments/:id(.:format) | appointments#destroy
  #
  # Calls template : Redirect to +appointments+
  #
  # [Returns]
  #    * @appointment - the deleted appointment
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {}
  #
  def destroy
    setAppointment
    @appointment.delete_date = Time.now
    @appointment.status = 'x'
    ## update canceled_datetime and canceled_by_id
    @appointment.canceled_by_id = current_user.user_id
    @appointment.canceled_datetime = Time.now
    if @appointment.save

      #Inform the invitees that the appointment was cancelled
      # email_invitees('appointment_cancelled', @appointment)
      # email_owner('appointment_cancelled', @appointment)
      ## therapist cancel appointment update changed_fee_amt in session to 0

      sessions = SessionLog.get_session_id_from_appointment(@appointment.id)
      if !sessions.blank?
        session = sessions.first
        session.update_attributes(changed_fee_amt: 0)
      end

      respond_to do |format|
        format.html { redirect_to appointments_url, notice: "Appointment deleted."}
        format.json { render :status => 200, :json => { action: :deleted, appointment: @appointment}}
      end
    else
      respond_to do |format|
        format.html { redirect_to appointments_url, notice: "Appointment deleted."}
        format.json { render :status => 409, :json => { action: :deleted, appointment: @appointment}}
      end

    end
  end

  ##
  # Decline the appointment - This method will change the status of the appointment to 'd' - Declined
  #
  # [Required field :]
  #   * :id
  #
  # Called from the Route : GET | /appointments/:id/decline(.:format) | appointments#decline
  #
  # Calls template : Redirect to +appointments+
  #
  # [Returns]
  #    * @appointment - the declined appointment
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {}
  #
  def decline
    setAppointment
    @appointment.status = 'd'
    if @appointment.save

      #Inform the invitees that the appointment was cancelled
      # email_invitees('appointment_declined', @appointment)
      # email_owner('appointment_declined', @appointment)

      respond_to do |format|
        format.html { redirect_to appointments_url, notice: "Appointment declined."}
        format.json { render :status => 200, :json => { action: :declined, appointment: @appointment}}
      end
    else
      respond_to do |format|
        format.html { redirect_to appointments_url, notice: "Appointment deleted."}
        format.json { render :status => 409, :json => { action: :declined, appointment: @appointment}}
      end

    end
  end

  private

  ##
  # Private convert_model_to_hash - Convert the model relation to an array and adds the patient name to the appointment
  #
  # Use to share common setup or constraints between actions.
  #
  def convert_model_to_hash(appointments)
    appointments = appointments.to_a.map(&:serializable_hash)
    appointments.each do |u|
      if !u["patient_id"].blank?
        p = Patient.find(u["patient_id"])
        u["patient"] = p
        u["patient_name"] = p.first_name + " " + p.last_name
        u["start_time"] = u["start_time"].strftime("%T")
        u["end_time"] =  u["end_time"].strftime("%T")
        # insurance = PatientInsurance.find_by_patient_id(u["patient_id"])
        # u["patient_insurance"] = insurance
      end
      # get therapis is used for patient appointment
      if !u["therapist_id"].blank?
        p = Therapist.find(u["therapist_id"])
        u["therapist"] = p
        u["therapist_name"] = p.first_name + " " + p.last_name
      end

      ## here check appointment is proccessed or not
      appointment_processed = false
      if Payment.find_by_appointment_id(u["id"]).present?
        appointment_processed = true
      end
      u["appointment_processed"] = appointment_processed
      # get therapist_declared_duration
      session_ids = SessionLog.get_session_id_from_appointment(u["id"])
      if !session_ids.blank?
        session_id = session_ids.first
        u["therapist_declared_duration"] = session_id.therapist_declared_duration
      end
    end
  end

  ##
  # Private getProfile - Creates the @user and @profile object based on the currently signed in user
  #
  # Use to share common setup or constraints between actions.
  #
  def getProfile
    @user = current_user
    @profile = @user.getProfileable
  end

  ##
  # Get patient list and add it to gon for use in js to easy implement search patient
  #
  def add_list_patient_to_gon
    @user = current_user
    if @user.account_type.downcase == "therapist"
      @patientlist = TherapistPatient.get_my_patients @user.user_id
      gon.push({ :patientlist => @patientlist})
    end
  end

  ##
  # Private setAppointment - Creates the appointment object based ion the "id" passed as a parameter
  #
  # Use to share common setup or constraints between actions.
  #
  def setAppointment
    @appointment = Appointment.find(params[:id])
  end

  ##
  # Private email_invitees - Used to send external email for a specific event
  #
  def email_invitees(event, apptmnt)
    apptmnt.invitees.each do |invitee|
      user = User.find(invitee.user_id)
      payload = {:user => user, :appointment => apptmnt}
      Outboundmail.outbound_event(event, user, payload)
    end
  end

  ##
  # Private email_owner - Used to send external email for a specific event
  #
  def email_owner(event, apptmnt)
    user = User.find(apptmnt.owner_id)
    payload = {:user => user, :appointment => apptmnt}
    Outboundmail.outbound_event(event, user, payload)
  end

  ##
  # Private appointment_params - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Use to share common setup or constraints between actions.
  #
  def appointment_params
    params.require(:appointment).permit(:start_time, :end_time, :date, :user_ids, :session_type,
    :therapist_id, :patient_id, :status, :owner_id, :note, :consent, :appointment_recs_id,
    :appointment_recs_excpt, :delete_date, :fee_amount, :stripe_token, :on_site_ind, :patient_ins_eligibility_id, :pre_charge_id, :processed_auth_date, :processed_amt, :estimated_insurance_adjustment, :canceled_by_id, :canceled_datetime, :_destroy)
  end
end
