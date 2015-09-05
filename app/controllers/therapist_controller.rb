##
# Therapist Controller.
# This controller is responsible for the managememt of the terapist profile and all sub models
#
# Created the first time a user of type therapist signs in.
#
# [Ability Configuration]
# * Therapist can
#  *. :index
#  *. :show
#  *. :update
#  *. :create
#  *. :profile
#  *. :patient
#  *. :searchform
#  *. :search
#  *. :get_patient_list
#
# * Patient can
#  *. :index
#  *. :profile
#  *. :searchform
#  *. :search
#
# * All can
#  *. :search
#
class TherapistController < ApplicationController
  require 'filelessIO'

  before_filter :authenticate_user!, :except => [:index, :profile, :search, :searchform, :searchresult, :get_relate_info]
  before_filter :add_list_patient_to_gon, :only => [:show, :profile, :index, :edit ,:patient]
  authorize_resource :class => false

  ##
  # Perform the therapist search based of the criteria sent from the searchform
  #
  # So basically, you call the web-service therapist/searchresult and the parameters used are:
  # - speciality : passing the speciality ID
  # - therapist_type : passing the therapist type
  # - payment_type : passing a payment type - insurance_payer_id
  # - state : passing a statre ID from the state_cde table
  # - zipcode : passing a zipcode
  # - name : partial name of the therapist first_name last_name, for name search like %first_name% and like %last_name%
  # - limit : sets the number of record returned
  # - offset : dictates the number of records skipped before starting to return records
  # - page : pagination page number, If not provided default to 1
  #
  # Only the parameters passed with values are used.
  #
  # Called from the Route : +therapist_searchresult+ | GET | /therapist/searchresult(.:format) | therapist#search
  #
  # Example : http://localhost:3000/therapist/searchresult?speciality=1&therapist_type=MFT&payment_type=visa&state=3&zipcode=27525&name=scott&limit=5&offset=0&page=1
  #
  # Calls template : views/therapist/searchresult.html.haml
  #
  # [Returns]
  #   * @resultcount - Total number of records without any limit
  #   * @result - List of therapist profile
  #
  def search

    # add gon
    gon.push({
      :speciality_cdes => SpecialityCde.all,
      :state_cdes => StateCde.all.order(:name),
      :license_type_cdes => LicenseTypeCde.all,
      :insurance_payers_names => InsurancePayersName.all,
      :user => current_user
      })


    ##### comment: If user don't pass any parameters, will list all the therapist has therapist_profile
    # if check_search_param
    #   respond_to do |format|
    #     format.html {
    #       flash[:danger] = "No search parameter passed. Please enter at least on search criteria."
    #        render :template => 'therapist/searchresult', :layout => 'public' ## add layout pulic to this view
    #       }
    #     format.json { render :status => 400, :json => { action: 'search'}}
    #   end
    # else

    joins = Array.new
    joins.push :therapist_profile
    joins.push :therapist_license

    @result = Therapist.joins(joins)

    #displays only approved therapists
    if Rails.env.stage? || Rails.env.production?  ## we will search approval therapist when production or stage mode.
      @result = @result.where("therapists.approval_status = 'A'")
    end

    #Searching for Speciality
    if !params[:speciality].blank?
      joins.push :therapist_speciality
      @result = @result.joins(:therapist_profile, :therapist_speciality)
      @result = @result.where("therapist_specialities.speciality_id = ?", params[:speciality])
    end

    #Searching for name
    if !params[:name].blank?
      name = params[:name].blank? ? "" : params[:name].split(" ")

      first_name = name[0].blank? ? "%" : '%' + name[0].downcase + '%'
      last_name = name[1].blank? ? "%" : '%' + name[1].downcase + '%'
      where = "(lower(therapists.first_name) LIKE ? and lower(therapists.last_name) LIKE ?)"
      if name.length == 1
        last_name = first_name
        where = "(lower(therapists.first_name) LIKE ? or lower(therapists.last_name) LIKE ?)"
      end
      puts Rails.env.development?
      if Rails.env.development? && name[0] =="debug"
        first_name = "%"
        last_name = "%"
      end

      @result = @result.where(where, first_name, last_name)
    end

    #Searching for State or Zipcode
    @result = @result.where("therapists.zipcode = ?", params[:zipcode]) if !params[:zipcode].blank?
    @result = @result.where("therapists.state_cde = ?", params[:state]) if !params[:state].blank?

    #Therapist Type Search (License Type)
    if !params[:therapist_type].blank?
      joins.push :therapist_license
      @result = @result.where("lower(therapist_licenses.license_type) = ?", params[:therapist_type].downcase)
    end

    # payment type search
    if !params[:payment_type].blank?
      joins.push :therapist_accept_insurance
      @result = @result.where("lower(therapist_accept_insurances.insurance_payer_id) = ?", params[:payment_type])
    end


    puts @result.to_sql
    @resultcount = @result.joins(joins).uniq.count
    @result = @result.joins(joins).limit(params[:limit]).offset(params[:offset]).uniq

    @result = Kaminari.paginate_array(search_result_completion(@result)).page(params[:page]).per(Therapist::PER_PAGE_RECORDS)
    # gon.push({
    #    limit: params[:limit],
    #   offset: params[:offset],
    #   result: @result
    # })

    respond_to do |format|
      format.html { render :template => 'therapist/searchresult', :layout => 'public' }  ## add layout pulic to this view
      format.json { render :status => 200, :json => { action: 'search', totalcount: @resultcount, limit: params[:limit], offset: params[:offset], result: @result }}
    end

  # end ##### comment: If user don't pass any parameters, will list all the therapist has therapist_profile
  end


  ###
  ## render layout for search api
  ###
  def searchresult
    gon.push({
      :speciality_cdes => SpecialityCde.all,
      :state_cdes => StateCde.all.order(:name),
      :license_type_cdes => LicenseTypeCde.all,
      :insurance_payers_names => InsurancePayersName.all,
      :user => current_user
      })
    render :layout => 'public'
  end
  ##
  # Deprecated - Show the therapist detail of the currently logged in user
  #
  # Can be replaced by +Edit+
  #
  # [Returns]
  #   * @therapist
  #   * @user
  #
  def show
    getProfile
    # put therapist and current_user to gon
    gon.push({:user => @user, :therapist => @therapist})
    render :layout => 'main'
    # respond_to do |format|
    #   format.html { redirect_to dashboards_path }
    #   format.json { render :status => 200, :json => { action: 'update', therapist: @therapist, user: @user }}
    # end
  end

  deprecate :show

  ##
  # Get the therapist profile from the therapist_id passed
  #
  # The ID is required in the URL as per the REST specification.
  #
  # Called from the Route : +therapist_profile+ | GET | /therapist/:therapist_id/profile(.:format) | therapist#profile
  #
  # Calls template :
  #
  # [Returns]
  #   * @therapist
  #
  def profile
    @therapist = Therapist.find(params[:therapist_id])
    if @therapist.present?
      ##### Get therapist email
      therapist_user = User.find(@therapist.user_id)
      therapist_email = therapist_user.email
      gon.push({ :therapist_email => therapist_email })
      # push current user and therapist into gon for get in javascript
      put_therapist_info_to_gon(@therapist)

      ## add therapist consent to gon
      gon.push({ :therapist_consent => @therapist.therapist_consent })

      ## add consent_template to gon
      consent_template = ConsentTemplate.where('active = ?', 1).first
      gon.push({ :consent_template => consent_template })

      ### here add Language Cdes, Speciality cdes, Demographics Served Cdes, Treament cdes, state_license_cde to gon
      push_codes_to_gon()
      ## put therapist_profile to gon
      gon.push({ :therapist_profile => @therapist.therapist_profile })

      ## if current user is patient add gon.patient use for patient add insurance
      @patient = []
      if current_user.account_type.downcase == "patient"
        @patient = Patient.find_by_user_id(current_user.user_id)
        gon.push({ :patient => @patient })
      end

      respond_to do |format|
        format.html { render :layout => 'public' }
        format.json { render :status => 200, :json => { action: 'profile', therapist: @therapist, therapist_email: therapist_email, patient: @patient, consent_template: consent_template }}
      end
    end
  end

  ##
  # Deprecated - Index - list all users and therapists
  #
  # [Returns]
  #   * @therapist
  #   * @user
  #
  def index
    @users = User.all
    @therapists = Therapist.all
    respond_to do |format|
      format.html { render :layout => 'main' }
      format.json { render :status => 200, :json => { action: 'index', therapists: @therapists, users: @users }}
    end
  end

  deprecate :index

  ##
  # Edit the therapist detail of the currently logged in user
  #
  # The ID is required in the URL as per the REST specification, but is ignored during processing. The currently signed in therapist is updated.
  #
  # Called from the Route : +edit_therapist+ | GET | /therapist/:id/edit.:format) | therapist#edit
  #
  # Calls template : views/therapist/edit.html.haml
  #
  # [Returns]
  #   * @therapist
  #   * @user
  #
  def edit
    getProfile
    # push current user and therapist into gon
    put_therapist_info_to_gon(@therapist)
    ### here add Language Cdes, Speciality cdes, Demographics Served Cdes, Treament cdes, state_license_cde to gon
    push_codes_to_gon()

    respond_to do |format|
      format.html { render :layout => 'edit_therapist' }
      format.json { render :status => 200, :json => { action: 'update', therapist: @therapist, user: @user }}
    end
  end
  ##
  # Update the therapist detail of the currently logged in user
  #
  # The ID is required in the URL as per the REST specification, but is ignored during processing. The currently signed in therapist is updated.
  #
  # Called from the Route : +therapist+ | PATCH | /therapist/:id.:format) | therapist#update
  #
  # Calls template : views/therapist/edit.html.haml
  #
  # [Returns]
  #   * @therapist
  #   * @user
  #
  #  [JSON parameter format]
  #     {"therapist":{"first_name":"name", "last_name":"same", "middle_name":"baz", "nick_name":"mynickname", "npi_no":"123", "gender":"M", "timezone":"123", "phone_work":"5147972699", "phone_home":"4507972699", "phone_mobile":"8097972699", "session_duration":"30", "normal_wrk_start_time":"", "normal_wrk_end_time":"", "therapist_language_attributes":{"0":{"language_cde":"en", "proficiency":"good", "id":"2", "_destroy":"false"}}, "address1":"1409 GAUTHIER ST", "address2":"Suite 1000", "city":"Ottawa", "state_cde":"", "zipcode":"12345", "country_cde":"233", "mail_address1":"Some", "mail_address2":"Thing", "mail_city":"Montreal", "mail_state_cde":"", "mail_zipcode":"h4e32w", "mail_country_cde":"39", "therapist_profile_attributes":{"tag_line":"This is my tag line", "about_me":"About you", "education":"some school", "school":"McGill U", "prof_memberships":"some", "experience_years":"18", "hourly_rate_min":"100.0", "hourly_rate_max":"132.0", "interview_dt":"2014/03/03", "emergency_contact_person":"some friend", "emergency_contact_ph_number":"613-888-5555", "emergency_contact_rel":"Spouse", "sliding_scale":"N", "accept_new_patient":"1", "viewable_on_search":"0", "charge_for_cancellation":"1", "treatment_approach":"CBT, DBT", "client_focus":"Depression, Anxiety, Codependency", "demographics_served":"Couple, Teen, LGBT, Military", "youtube_link":"www.youtube.com/embed/3l1GjjmFso4", "web_uri_link":"www.klygsolution.com", "hear_about_us_id":"2","id":"2"}, "therapist_license_attributes":{"0":{"license_number":"12341234", "state":"tx", "start_date":"2001/04/01", "end_date":"2017/03/03", "id":"1", "_destroy":"false"}, "1":{"license_number":"1234546", "state":"fl", "start_date":"2002/03/01", "end_date":"2016/03/01", "id":"3", "_destroy":"false"}, "2":{"license_number":"123456789", "state":"ca","start_date":"2005/09/06", "end_date":"2019/06/03", "id":"4", "_destroy":"false"}}, "therapist_speciality_attributes":{"0":{"speciality_id":"1", "seq_speciality_cde":"1", "_destroy":"false", "id":"3"}, "1":{"speciality_id":"18", "seq_speciality_cde":"1", "_destroy":"false", "id":"5"}, "2":{"speciality_id":"17", "seq_speciality_cde":"9", "_destroy":"false", "id":"4"}}, "therapist_accept_insurance_attributes":{"0":{"insurance_id":"10", "contract_ref_no":"qwerqwerqw", "start_date":"2010/02/13", "end_date":"", "entity_id":"2", "_destroy":"false", "id":"2"}}}}
  #
  def update
    getProfile
    if @therapist.update_attributes!(therapist_params)
      # put therapist info to gon for get in javascript
      put_therapist_info_to_gon(@therapist)
      respond_to do |format|
        format.html { redirect_to dashboards_path, :notice =>  "Profile saved." }
        format.json { render :status => 200, :json => { action: 'update', therapist: @therapist, user: @user,
                                                        therapist_profile: @therapist_profile,
                                                        therapist_speciality: @therapist_speciality,
                                                        therapist_language: @therapist_language,
                                                        therapist_license: @therapist_license,
                                                        therapist_accept_insurance: @therapist_accept_insurance
                                                        }}
      end
    else
      respond_to do |format|
        format.html { render action: 'edit' }
        format.json { render :status => 409, :json => { action: 'update', therapist: @therapist, user: @user }}
      end
    end
  end


  ##

  # Returns the patient profile of a patient with notes and the therapist porfile
  #
  # Called from the Route : +therapist_patient+ | GET | /therapist/patient/:patient_id(.:format) | therapist#patient
  #
  # Calls template : views/therapist/patient_profile.html.haml
  #
  # [Returns]
  #    * @user
  #    * @therapist
  #    * @patient - patient_profile
  #    * @patient_note
  #
  def patient
    getProfile
    @patient = Patient.find(params[:patient_id])
    @patient_note = Note.patient_note_for_type(@therapist.therapist_id, @patient.patient_id, 'patient').first
    @patient_note = Note.new if @patient_note.blank?
    ## push @patient, @user to gon for use in javascript
    gon.push({:user => @user, :therapist => @therapist, :patient => @patient, :patient_note => @patient_note })
    respond_to do |format|
      format.html { render :template => 'therapist/patient_profile', :layout => 'main' }
      format.json { render :status => 200, :json => { action: :patient,
        user: @user, therapist: @therapist, patient: @patient, patient_notes: @patient_note}}
    end
  end

  ##
  # Returns the list of patient associtaed with the current therapist
  #
  # Called from the Route : +therapist_getpatients+ | GET | /therapist/getpatientlist(.:format) | therapist#get_patient_list
  #
  # Calls template : views/therapist/get_patient_list.html.haml
  #
  # [Returns]
  #    * @patient_list
  #
  def get_patient_list
    getProfile
    @patientlist = TherapistPatient.get_my_patients @therapist.user_id
    respond_to do |format|
      format.html { render :template => 'therapist/get_patient_list' }
      format.json { render :status => 200, :json => { action: :get_patient_list,
        patient_list: @patientlist}}
    end
  end


  ##
  # Saves the avatar of the therapist in orogonal format and thumbnial version under the same uploader
  #
  # Called from the Route : +therapist_save_avatar+ | POST | /therapist/save_avatar(.:format) | therapist#save_avatar
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
    @therapist.picture_filelink = io
    @therapist.save!
    respond_to do |format|
      format.html { render :template => 'therapist/save_avatar' }
      format.json { render :status => 200, :json => { action: :save_picture}}
    end
  end

  ##
  # Called to retrieve the URL of the avatars original size anad thumbnail
  #
  # Called from the route : +therapist_get_avatar+ | GET | /therapist/get_avatar(.:format) | therapist#get_avatar
  #
  #   [Returns]
  #     {"action":"get_avatar","picture":{"picture_filelink":{"url":"/uploads/therapist/picture_filelink/2/avatar.jpg","thumb":{"url":"/uploads/therapist/picture_filelink/2/thumb_avatar.jpg"}}}}
  #
  def get_avatar
    getProfile
    respond_to do |format|
      format.html { render :template => 'therapist/get_avatar' }
      format.json { render :status => 200, :json => { action: :get_avatar, picture: @therapist.picture_filelink}}
    end
  end


  ##
  #
  # Called from the Route : +therapist_remove_avatar" | PUT | /therapist/remove_avatar(.:format) | therapist#remove_avatar
  #
  # [Returns]
  # Returns status 200 for success exception on failure
  #
  def remove_avatar
    getProfile
    @therapist.remove_picture_filelink!
    @therapist.save
    respond_to do |format|
      format.json { render :status => 200, :json => { action: :remove_picture}}
    end
  end


  ##
  # Empty action to display the search form in View mode only
  #
  def searchform
    @patient_note = Note.where(:therapist_id => @therapist.therapist_id, :patient_id => @patient.patient_id, :note_type => 'patient').first
    @patient_note = Note.new if @patient_note.blank?
    # put user, therapist, patien, patient_note to gon
    gon.push({:user => @user, :profile => @therapist, :patient =>@patient, :patient_note => @patient_note})
    # update layout to main layout for therapist/patient_profile
    render :layout => 'main', :template => 'therapist/patient_profile'

  end
    ### Get relate infor use for therapist update profile
  def get_relate_info
    getProfile
    @therapist_profile = @therapist.therapist_profile
    @therapist_speciality = @therapist.therapist_speciality
    @therapist_language = @therapist.therapist_language
    @therapist_license = @therapist.therapist_license
    @therapist_accept_insurance = @therapist.therapist_accept_insurance
    respond_to do |format|
      format.json { render :status => 200, :json => {:user => current_user, :therapist => @therapist,
                                                    :therapist_profile => @therapist_profile,
                                                    :therapist_speciality => @therapist_speciality,
                                                    :therapist_language => @therapist_language,
                                                    :therapist_license => @therapist_license,
                                                    :therapist_accept_insurance  => @therapist_accept_insurance
                                                  }
                  }
    end
  end


  private

  ##
  # Private search_result_completion - Convert the search result to an array and adds the licenses and assurances to the result
  #
  # Use to share common setup or constraints between actions.
  #
  def search_result_completion(results)
    results.each do |r|
      #adding the profile
      profile = TherapistProfile.find(r["therapist_id"])
      r["profile"] = profile

      #adding Therapist Licenses
      licenses = TherapistLicense.where therapist_id: r["therapist_id"]
      r["therapist_licenses"] = licenses

      #adding Therapist Assurances
      assurances = TherapistAcceptInsurance.where entity_id: r["therapist_id"]
      assurances = assurances.to_a.map(&:serializable_hash)
      assurances.each do |a|
        names = InsurancePayersName.where payers_id: a["insurance_payer_id"]
        a["names"] = names
      end
      r["therapist_accept_assurances"] = assurances
    end
  end


  ##
  # Private getProfile - Creates the @user and @therapist object based on the currently signed in user
  #
  # Use to share common setup or constraints between actions.
  #
  def getProfile
    @user = current_user
    @therapist = @user.getProfileable
  end

  ##
  # Get infor of therapist: profile,language, license, accept_insurance, speciality
  # And push it in to gon for get in the view. (javascript)
  #
  #
  def put_therapist_info_to_gon(therapist)

    # push current user and therapist into gon
    @therapist_profile = therapist.therapist_profile
    @therapist_speciality = therapist.therapist_speciality
    @therapist_language = therapist.therapist_language
    @therapist_license = therapist.therapist_license
    @therapist_accept_insurance = therapist.therapist_accept_insurance

    gon.push({:user => current_user, :therapist => therapist,
              :therapist_profile => @therapist_profile,
              :therapist_speciality => @therapist_speciality,
              :therapist_language => @therapist_language,
              :therapist_license => @therapist_license,
              :therapist_accept_insurance  => @therapist_accept_insurance
              })
  end


  def push_codes_to_gon
    ### here add Language Cdes, Speciality cdes, Demographics Served Cdes, Treament cdes, state_license_cde to gon
    gon.push({
      :language_cdes => LanguageCde.all,
      :speciality_cdes => SpecialityCde.all,
      :demographics_served_cdes => DemographicsServedCde.all,
      :treatment_approach_cdes => TreatmentApproachCde.all,
      :state_license_cdes => StateLicenseCde.all,
      :license_type_cdes => LicenseTypeCde.all,
      :insurance_payers_name => InsurancePayersName.all,
      :state_cdes => StateCde.all.order(:name)
      })
  end

  ##
  # Get patient list and add it to gon for use in js to easy implement search patient
  #
  def add_list_patient_to_gon
    @user = current_user
    if @user
      @patientlist = TherapistPatient.get_my_patients @user.user_id
      gon.push({ :patientlist => @patientlist})
    end
  end


  ##
  # Private therapist - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Use to share common setup or constraints between actions.
  #
  def therapist_params
    params.require(:therapist).permit(Therapist.therapist_whitelist,
      therapist_profile_attributes:Therapist.therapist_profile_whitelist,
      therapist_language_attributes:Therapist.therapist_language_whitelist,
      therapist_license_attributes:Therapist.therapist_license_whitelist,
      therapist_speciality_attributes:Therapist.therapist_speciality_whitelist,
      therapist_accept_insurance_attributes:Therapist.therapist_insurance_whitelist)
  end

  ##
  # Private search param - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Use to share common setup or constraints between actions.
  #
  # Strong Parameter white list of parameters.
  def check_search_param
    params[:speciality].blank? && params[:therapist_type].blank? && params[:state].blank? && params[:zipcode].blank? && params[:name].blank? && params[:payment_type].blank? ? true : false
  end

end
