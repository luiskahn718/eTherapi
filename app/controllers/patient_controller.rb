##
# Patient Controller.
# This controller is responsible for the managememt of the patient profile.
#
# Created the first time a user of type patient signs in.
#
# [Ability Configuration]
# * Therapist can
#   *. NONE
#
# * Patient can
#  *. :update
#  *. :edit
#  *. :show
#  *. :accept_invitation_from
#
class PatientController < ApplicationController
  require 'filelessIO'
  require "stripe"
  skip_before_filter  :json_verify_authenticity_token
  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end

  before_filter :authenticate_user!

  authorize_resource :class => false

  ##
  # Show the patient detail of the currently logged in user
  #
  # Called from the Route : +patient+ | GET | /patient/:id(.:format) | patient#show
  #
  # Calls template : views/patient/edit.html.haml
  #
  # [Returns]
  #   * @patient
  #   * @user
  #
  def show
    getProfile
    # put patient and current_user to gon
    # add list card of a patient to gon for use js
    listcards = []
    if @patient.stripe_customer_id.present?
      listcards = Stripe::Customer.retrieve(@patient.stripe_customer_id).cards.all.try(:data)
    end
    gon.push({
              :user => @user,
              :patient => @patient,
              :list_cards => listcards
              })
    render :layout => 'main'
    # respond_to do |format|
    #   format.html { render action: 'edit' }
    #   format.json { render :status => 200, :json => { action: 'show', patient: @patient, user: @user }}
    # end
  end

  ##
  # edit the patient detail of the currently logged in user
  #
  # Called from the Route : +edit_patient+ | GET | /patient/:id/edit.:format) | patient#edit
  #
  # Calls template : views/patient/edit.html.haml
  #
  # [Returns]
  #   * @patient
  #   * @user
  #
  def edit
    getProfile
    # put patient and current_user to gon
    gon.push({:user => @user,
              :patient => @patient,
              :patient_insurances => @patient.patient_insurance,
              :state_cdes => StateCde.all.order(:name),
              :country_cdes => CountryCde.all.select{|c| c.name == 'United States'} + CountryCde.all.select{ |c| c.name != 'United States'}, # Little trick, get United States first
              :insurance_payers_name => InsurancePayersName.all
              })
    render :layout => 'main'
    # respond_to do |format|
    #   format.html { render action: 'edit' }
    #   format.json { render :status => 200, :json => { action: 'edit', patient: @patient, user: @user }}
    # end
  end


  ## Get patient profile infor use for update patient profile 
  ## handle back button
  def get_patient_info
    getProfile

    respond_to do |format|
      format.json { render :status => 200, :json => {:user => @user,
                                                    :patient => @patient,
                                                    :patient_insurances => @patient.patient_insurance,
                                                    :state_cdes => StateCde.all.order(:name),
                                                    :country_cdes => CountryCde.all.select{|c| c.name == 'United States'} + CountryCde.all.select{ |c| c.name != 'United States'}, # Little trick, get United States first
                                                    :insurance_payers_name => InsurancePayersName.all
                                                    }
                  }
    end
  end
  ##
  # Update the patient detail of the currently logged in user
  #
  # The ID is required in the URL as per the REST specification, but is ignored during processing. The currently signed in patient is update.
  #
  # Called from the Route : +patient+ | PATCH | /patient/:id.:format) | patient#update
  #
  # Calls template : views/patient/edit.html.haml
  #
  # [Returns]
  #   * @patient
  #   * @user
  #
  #  [JSON parameter format]
  #     {"patient":{"first_name":"poutine", "last_name":"patate", "middle_name":"Y", "nick_name":"", "date_of_birth":"1904-04-08", "ssn":"", "language":"br", "gender":"M", "timezone":"8", "phone_work":"613-797-2699", "phone_home":"", "phone_mobile":"", "medical_history":"my medical history", "picture_filelink":"", "address1":"", "address2":"", "city":"", "state_cde":"", "zipcode":"", "country_cde":"", "mail_address1":"", "mail_address2":"", "mail_city":"", "mail_state_cde":"", "mail_zipcode":"", "mail_country_cde":"", "patient_insurance_attributes":{"0":{"insurance_payer_id":"2", "policy_number":"123455678", "group_number":"9876", "group_name":"The Group", "seq":"1", "subscriber_id":"qwerqw452134", "subscriber_last_name":"REST", "subscriber_first_name":"TEST", "subscriber_dob":"2000-02-23", "subscriber_address1":"6547 Dastreet", "subscriber_address2":"", "subscriber_city":"LA", "subscriber_state_cde":"CA", "subscriber_zipcode":"90210", "subscriber_country_cde":"US", "subscriber_relationship":"self", "id":"", "_destroy":"false"}}}}
  #
  def update
    getProfile
    if @patient.user_id == nil
      @patient.user_id = @user.user_id
    end
    if @patient.update_attributes(patient_params)
      respond_to do |format|
        format.html { render action: 'dashboards', :notice =>  "Profile saved." }
        format.json { render :status => 200, :json => { action: 'update', patient: @patient, user: @user, :patient_insurances => @patient.patient_insurance }}
      end
    else
      respond_to do |format|
        format.html { render action: 'edit' }
        format.json { render :status => 409, :json => { action: 'update', patient: @patient, user: @user }}
      end
    end
  end


  ##
  # Accept_invitation_from accept the invitaion from the therapist passed in the URL
  #
  # [Required param]
  #   *. :id - The Therapist_id of the inviter
  #
  # The ID is required in the URL. This should be the therapist_id of the therapist that initiated the invitation
  #
  # Called from the Route : +accept_invitation_from_patient+ | GET | /patient/:id/accept_invitation_from.:format) | patient#accept_invitation_from
  #
  # Calls template : views/dashboards
  #
  # [Returns]
  #
  #  [JSON parameter format]
  #     {}
  #
  def accept_invitation_from
    if TherapistPatient.accept_invitation(params[:id], current_user.user_id)
      respond_to do |format|
        format.html { render action: 'dashboards', :notice =>  "Invitation Accepted." }
        format.json { render :status => 200 }
      end
    else
      respond_to do |format|
        format.html { render action: 'dashboards', :notice =>  "Invitation not found." }
        format.json { render :status => 404 }
      end
    end
  end

  ##
  # Saves the avatar of the therapist in orogonal format and thumbnial version under the same uploader
  #
  # Called from the Route : +patient_save_avatar+ | POST | /patient/save_avatar(.:format) | patient#save_avatar
  #
  #   [Returns]
  #     Returns status 200 for success exception on failure
  #
  #  [JSON parameter format]
  #     {"picture":"+base64picturestream+"}
  #
  def save_avatar
    getProfile
    io = FilelessIO.base64_decoder(params[:picture], 'avatar.jpg')
    @patient.picture_filelink = io
    @patient.save!
    respond_to do |format|
      format.html { render :template => 'patient/save_avatar' }
      format.json { render :status => 200, :json => { action: :save_avatar}}
    end
  end

  ##
  # Called to retrieve the URL of the avatars original size anad thumbnail
  #
  # Called from the route : +patient_get_avatar+ | GET | /patient/get_avatar(.:format) | patient#get_avatar
  #
  #   [Returns]
  #     {"action":"get_avatar","picture":{"picture_filelink":{"url":"/uploads/patient/picture_filelink/2/avatar.jpg","thumb":{"url":"/uploads/patient/picture_filelink/2/thumb_avatar.jpg"}}}}
  #
  def get_avatar
    getProfile
    respond_to do |format|
      format.html { render :template => 'patient/get_avatar' }
      format.json { render :status => 200, :json => { action: :get_avatar, picture: @patient.picture_filelink}}
    end
  end

  ##
  #
  # Called from the Route : +patient_remove_avatar" | PUT | /patient/remove_avatar(.:format) | patient#remove_avatar
  #
  # [Returns]
  # Returns status 200 for success exception on failure
  #
  def remove_avatar
    getProfile
    @patient.remove_picture_filelink!
    @patient.save
    respond_to do |format|
      format.json { render :status => 200, :json => { action: :remove_picture}}
    end
  end

  ##
  #
  #
  #
  #########################################
  def payment

    #### add default gon
    getProfile

    gon.push({
      :user => @user,
      :patient => @patient,
      :patient_insurances => @patient.patient_insurance,
      :insurance_payers_names => InsurancePayersName.all
      })

    respond_to do |format|
      format.html { render :layout => 'main' }
    end
  end


  ###
  # get info of a patient for render in payment page
  #
  #
  ################################################
  def info
    getProfile

    respond_to do |format|
      format.json { render :status => 200, :json => { :user => @user, :patient => @patient, :patient_insurances => @patient.patient_insurance, :insurance_payers_names => InsurancePayersName.all }}
    end

  end

  private

  ##
  # Private getProfile - Creates the @user and @patient object based on the currently signed in user
  #
  # Use to share common setup or constraints between actions.
  #
  def getProfile
    @user = current_user
    @patient = @user.getProfileable
  end

  ##
  # Private patient - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Use to share common setup or constraints between actions.
  #
  # Strong Parameter white list of parameters. Primarily defined in the Patient model, for reusability.
  def patient_params
    params.require(:patient).permit(Patient.patient_whitelist, patient_insurance_attributes:Patient.patient_insurance_whitelist)
  end
end