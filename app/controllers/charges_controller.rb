 ##
# Stripe Charges Controller.
# This controller is responsible for the managememt of all the stripe charges functions
#
# [Ability Configuration]
#
#   1. :createcustomer, create a customer Id on sttripe and save it for future use using a token
#   2. :listcards, list all the cards for a customer
#   3. :precharge, does a preauthorization on the card or default card
#   4. :chargecustomer, take the preauthorization token and charges
#   5. :addcard, adds a card to an existing customer
#   6. :deletecard, deletes a card
#   7. :defaultcard, make a card the default card
#   8. :getpublishablekey, returns the stripe publishable key
#
# * Patient can
#   1. :createcustomer
#   2. :listcards
#   3. :precharge
#   4. :chargecustomer
#   5. :addcard
#   6. :deletecard
#   7. :defaultcard
#   8. :getpublishablekey
#
class ChargesController < ApplicationController
  require "stripe"

  skip_before_filter  :json_verify_authenticity_token
  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end
  # Before precess filters
  before_filter :authenticate_user!

  authorize_resource :class => false

  # The new charge uses stripes checkout to crate the credit card payment screen not used by eTherapi at this stage
  def new
    getProfile
    #puts @user.inspect
    # Amount in cents
    puts "##########################################################"
    puts params[:amount]
    @amount = params[:amount].to_i
  end
  # Creates a Pre-Authorization Charge for the to be created Appointment
  #
  # [Required field :]
  #    * :appointment id
  #    * :amount
  # [Optional field]
  #    * :stripe_card_id
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Charge Object
  #   on error from stripe returns the Stripe error

  def createprecharge   ##On succesful charge take the charge token and update the appointment

    getProfile

    if params[:amount] <= 100 #handle for fee is $0.00
      respond_to do |format|
        # format.json {render json: {message: "Not create precharge with amount=#{params[:amount]}"}}
        format.json {render json: {charge: []}}
      end
    else
      begin
      if !params[:stripe_card_id].nil?
        charge = Stripe::Charge.create(
          :amount      => params[:amount],
          :currency    => 'usd',
          :customer    => @profile.stripe_customer_id,
          :card        => params[:stripe_card_id],
          :description => 'eTherapi customer',
          :capture     => false
        )
      else
        charge = Stripe::Charge.create(
        :amount      => params[:amount].to_f,
        :currency    => 'usd',
        :customer    => @profile.stripe_customer_id,
        :description => 'eTherapi customer',
        :capture     => false
        )
      end

      rescue Stripe::CardError => e
        body =e.json_body
        return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
      end
      respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: {charge: charge}}
      end
    end
  end
  # Creates a a customer on Stripe and save the stripe custome id on the Patient Table
  #
  # [Required field :]
  #    * :stripeToken
  # [Optional field]
  #    * None
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Customer Object
  #   on error from stripe returns the Stripe error
  def createcustomer
    getProfile

    if !@profile.stripe_customer_id.blank?
      respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: {status: 500, error: "Existing Stripe Customer"}}
      end
    else
      begin
      customer = Stripe::Customer.create(
        :email => @user.email,
        :card  => params[:stripeToken]  ###tok_104HyH25gkO1yVKfuuy2Ft8y
        )
      rescue Stripe::CardError => e
        body =e.json_body
        return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
      else
        patient = Patient.find(@profile.patient_id)
        patient.stripe_customer_id = customer.id
        patient.save
         respond_to do |format|
          format.html {render action: dashboards}
          format.json {render json: customer}
        end
      end
    end


  end
  # Charge the Customer for the selected Appointment
  #
  # [Required field :]
  #    * :appintment id
  #    * :amount
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : views/appointments/edit.html.haml
  #
  # [Returns]
  #    * Json Stripe Charge Object
  #   on error from stripe returns the Stripe error
  def chargecustomer
    getProfile

    amount = params[:amount]
    # get customer id from appointment
    appt = Appointment.find(params[:appointment_id])

    if amount < 100
      ## Don't call stripe charge api.
      ## Just update the appointment and payment
      payment = save_payment_and_update_appointment(appt, @user, @patient, charge.id, amount)
      return render :json => {:success => true, :charge => "Not call stripe api with amount = #{amount}", :payment => payment }
    else
      if !appt.pre_charge_id.present? ## Not have pre_charge_id
        begin
        charge = Stripe::Charge.create(
          :amount      => params[:amount].to_f,
          :currency    => 'usd',
          :customer    => @profile.stripe_customer_id,
          :description => 'eTherapi customer',
          :capture     => true
        )
        rescue Stripe::StripeError => e
          body = e.json_body
          return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
        else  ###SUCCESS CHARGE
          ### SAVE TO PAYMENT TABLE
          payment = save_payment_and_update_appointment(appt, @user, @patient, charge.id, amount)
          return render :json => {:success => true, :charge => charge, :payment => payment }
        end
      else
        ## here appointment have pre_charge_id
        begin
        retrieve = Stripe::Charge.retrieve(appt.pre_charge_id)
        rescue Stripe::StripeError => e
          # Display a very generic error to the user, and maybe send
          # yourself an email
          body = e.json_body
          return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
        else
          ## retrieve success
          if retrieve.refunds.length > 0 ### have refund mean the preauthorize is expired
            ### create new charge
            begin
            charge = Stripe::Charge.create(
              :customer    => appt.stripe_token,
              :amount      => amount,
              :description => 'eTherapi customer',
              :currency    => 'usd',
              :capture     => true
            )
            rescue Stripe::StripeError => e
              # Display a very generic error to the user, and maybe send
              # yourself an email
              body = e.json_body
              return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
            else ###SUCCESS CHARGE
              ### SAVE TO PAYMENT TABLE
              payment = save_payment_and_update_appointment(appt, @user, @patient, charge.id, amount)
              return render :json => {:success => true, :charge => charge, :payment => payment }
            end
          else ## still not expired
            ## check if amount > retrieve.amount
            if amount.to_f != retrieve.amount.to_f ## incase chagre_fee_amount updated and it != processed_amt
              ## create new charge
              begin
              new_charge =Stripe::Charge.create(
                :customer    => appt.stripe_token,
                :amount      => amount,
                :description => 'eTherapi customer',
                :currency    => 'usd',
                :capture     => true
              )
              rescue Stripe::StripeError => e
                # Display a very generic error to the user, and maybe send
                # yourself an email
                body = e.json_body
                return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
              else ###SUCCESS CHARGE
                ### SAVE TO PAYMENT TABLE
                payment = save_payment_and_update_appointment(appt, @user, @patient, new_charge.id, amount)
                return render :json => {:success => true, :charge => new_charge, :payment => payment }
              end
            else
              begin
              new_charge = retrieve.capture
              rescue Stripe::StripeError => e
                # Display a very generic error to the user, and maybe send
                # yourself an email
                body = e.json_body
                return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
              else ###SUCCESS CHARGE
                ### SAVE TO PAYMENT TABLE
                payment = save_payment_and_update_appointment(appt, @user, @patient, new_charge.id, amount)

                return render :json => {:success => true, :charge => new_charge, :payment => payment }
              end
            end
          end
        end
      end
    end
  end

  def save_payment_and_update_appointment(appointment, user, patient, charge_id, amount)
    payment=Payment.new
    payment.appointment_id = appointment.id
    if user.account_type.downcase == "therapist"
      payment.patient_id = appointment.patient_id
    else
      payment.patient_id = profile.patient_id
    end
    payment.ref_no = charge_id
    payment.amount = amount/100
    payment.save
    ### UPDATE processed_amt in appointment
    appointment.update_attributes( :processed_auth_date => Time.now )
    return payment
  end

  # List all the credit/debit cards for a patient registered on stripe
  #
  # [Required field :]
  #    * NONE
  # [Optional field]
  #    * NONE
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Charge Object
  #   on error from stripe returns the Stripe error
  def listcards
    getProfile

    if @profile.stripe_customer_id.present?
      cards = Stripe::Customer.retrieve(@profile.stripe_customer_id).cards.all

      respond_to do |format|
          format.html {render action: dashboards}
          format.json {render json: cards[:data]}
      end
    else # return empty array if user(patient) have not any card
      respond_to do |format|
        format.json {render json: []}
      end
    end

  end

  # Adds a card to a patient on stripe
  #
  # [Required field :]
  #    * :stripeToken
  # [Optional field]
  #    * None
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Card Object
  #   on error from stripe returns the Stripe error
  def addcard
    getProfile
    begin
    customer = Stripe::Customer.retrieve(@profile.stripe_customer_id)
    rescue Stripe::StripeError => e
      body = e.json_body
      return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
    else
      begin
        card = customer.cards.create(:card => params[:stripeToken])
      rescue Stripe::StripeError => e
        body = e.json_body
        return render :json => {:status => 422, :success => false, :message => body[:error][:message]}
      else
        respond_to do |format|
          format.html {render action: dashboards}
          format.json {render json: card.to_s}
        end
      end
    end
  end
  # Deletes a card for a patient on stripe
  #
  # [Required field :]
  #    * :stripe_card_id
  # [Optional field]
  #    * None
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Card Object
  #   on error from stripe returns the Stripe error
  def deletecard
    getProfile

    customer = Stripe::Customer.retrieve(@profile.stripe_customer_id)
    card = customer.cards.retrieve(params[:stripe_card_id]).delete

    respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: card.to_s}
    end

  end
  # makes a card the default card for a patient on stripe
  #
  # [Required field :]
  #    * :stripe_card_id
  # [Optional field]
  #    * None
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Card Object
  #   on error from stripe returns the Stripe error
  def defaultcard
    getProfile

    customer = Stripe::Customer.retrieve(@profile.stripe_customer_id)
    customer.default_card = params[:stripe_card_id]
    customer.save
    ## add response
    respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: customer.to_s}
    end

  end
  # Rerieves the Stripe Publishable key from the configuration system
  #
  # [Required field :]
  #    * NONE
  # [Optional field]
  #    * None
  #
  # Called from the Route : +edit_appointment+ | GET | /appointments/:id/edit(.:format) | appointments#edit
  #
  # Calls template : none
  #
  # [Returns]
  #    * Json Stripe Card Object
  #   on error from stripe returns the Stripe error
  def getpublishablekey
    respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: {publishable_key: Rails.configuration.stripe[:publishable_key]}}
    end
  end

 def createtoken     ####### not to be used except for testing
   token = Stripe::Token.create(
    :card => {
      :number => "4012888888881881",
      :exp_month => 6,
      :exp_year => 2017,
      :cvc => "311"
    },
    )
    respond_to do |format|
        format.html {render action: dashboards}
        format.json {render json: token}
    end
 end
 def getProfile
    @user = current_user
    @profile = @user.getProfileable
  end

end