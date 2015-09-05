class SessionLogController < ApplicationController

  require "curb"
  require "json"
  before_filter :authenticate_user!
  authorize_resource :class => false

  Apikey = "3dbledogijxvbbmfhlrfkixhvzr6mmphaybyphjrpqcyr8vu7dxy1gow4udj6rcg"
  Secretkey = "cksvpmkoju3a36r1gsbr3zksjjmtvxjzdxphbgdy3nguvbcvw7gznd0ljkmdxwwi"
  Width_perc_value_username = 250;
  Height_perc_value_username = 200;
  Width_perc_value_tocall = 500;
  Height_perc_value_tocall = 400;

  Therapist_id = "d1245"  ### Just for testing
  Client_id    = "d2973"      ### Just for testing
   ##
  # Update the session_log
  #
  # The SESSION LOG ID is required
  #
  # Called from the Route : +patient+ | PATCH | /patient/:id.:format) | patient#update
  #
  # Calls template : NONE
  #
  # [Returns]
  #   * sessionlog

  #
  #  [JSON parameter format]
  #     {"session_log":{"???to be added???"}}}}
  #
  def update

    @sessionlog = SessionLog.find(params[:session_log][:session_id])

    if @sessionlog.update_attributes(session_log_params)
      ## https://projects.invisionapp.com/share/DXT8H5AN#/screens/23264482?maintainScrollPosition=false
      ## update fee in appointment
      ## here modify update session_log to update appointment fee
      respond_to do |format|
        format.html { render action: 'dashboards', :notice =>  "Session Log saved." }
        format.json { render :status => 200, :json => { action: 'update', session_log: @sessionlog}}
      end
    else
      respond_to do |format|
        format.html { render action: 'edit' }
        format.json { render :status => 409, :json => { action: 'update', session_log: @sessionlog }}
      end
    end
  end

  def join

    getProfile
    appointment = Appointment.find(params[:appointment_id])


    # convert appointment to hash and add info of patient, therapist to patient.
    # Add it to gon for get in javascript
    @gon_appointment = convert_appointment_to_hash(appointment)
    gon.push({appointment: @gon_appointment,
              user: current_user})
    ## Get note in here
    notes = []
    ## get session_id for appoinment
    ## if appointment have session_id
    ## get the notes and add it in to gon
    session_ids = SessionLog.get_session_id_from_appointment(appointment.id)
    if !session_ids.blank?
      session_id = session_ids.first
      notes = Note.session_notes(session_id).additional
      gon.push({session_id: session_id,
                notes: notes
        })
    end

    ## get patient_email
    patient_user = User.find_by_user_id(Patient.find_by_patient_id(appointment.patient_id).user_id)
    gon.push({ patient_email: patient_user.email,
               patient_user_id: patient_user.user_id
              })

    ## push it in to gon
    gon.push({notes: notes})

    prefix = 'd' unless Rails.env.production?

    patient_id = prefix + appointment.get_patient_user_id.to_s
    therapist_id = prefix + appointment.get_therapist_user_id.to_s

    if @user.is_patient?
      @vseelink = getClientVSeeURI(patient_id, therapist_id)
      template = "session/patient_session"
    elsif @user.is_therapist?
      # @vseelink = getTherapistVSeeURI(patient_id, therapist_id)
      @vseelink = getTherapistVSeeURI(therapist_id, patient_id)
      template = "session/therapist_session"
    end
    ## add vseelink to gon
    gon.push({vseelink: @vseelink})

    respond_to do |format|
      format.html {render template, :layout => 'session'}
      format.json {render json: {data: @vseelink}}
    end
  end

  def index
    # getProfile


    ####test Therapist
    @vseelink = getTherapistVSeeURI(Client_id, Therapist_id)

    template = "session/therapist_session"

    render :template => template


  end


  def getProfile
    @user = current_user
    @profile = @user.getProfileable
  end


  # get Client Vsee Uri
  def getClientVSeeURI(client_id, therapist_id)

    commands ={"commands"     => [
        {"setUser"   => {"username" => "etherapi+#{client_id}", "password" => '%etherapi%'}},
      	{"callAutoAccept"     => {"enabled" => true, "username" => "etherapi+#{therapist_id}"}},
        {"setAddressBook"     => {"enabled" => false}},
        {"setFirstTutorial"   => {"enabled" => false}},
        {"setOutlookImport"   => {"enabled" => false}},
        {"setCallSurvey"      => {"enabled" => false}},
        {"setHistory"         => {"enabled" => false}},
        {"setVideoWindow"     => {"username" => "etherapi+#{client_id}", "x" =>50, "y" => 200, "width" => Width_perc_value_username, "height" => Height_perc_value_username, "pinned" => true}},
        {"setVideoWindow"     => {"username" => "etherapi+#{therapist_id}", "x" => Width_perc_value_username+200, "y" => Height_perc_value_username+50, "width" => Width_perc_value_tocall, "height" => Height_perc_value_tocall, "pinned" => true}}
      ]
    }
    init = {"init" => commands}
    #waitcall = {"waitForCall" => {"timeout" => 1000, "autoaccept" => true, "acceptuser" => "etherapi+#{therapist_id}"}}
    startcall = {"startCall" => {"username" => "etherapi+#{therapist_id}", "timeout" => 3600}}
    fields = {"secretkey" => Secretkey, "uris" => [[init, startcall]]}
    #puts commands
    user_json = JSON.generate(fields)
    #puts user_json

    ####Start of HTTP Request
    url = "https://api.vsee.com/uri/create?apikey=" + Apikey
    headers = {}
    headers["Accept"] = "application/json"
    headers["Content-Type"] = "application/json"
    request = Curl::Easy.new
    request.url = url
    request.verbose = true
    request.headers=headers
    request.ssl_verify_peer = false
    request.ssl_verify_host = false
    #request.ssl_version
    #request.useragent = "Ruby/Curb"


    request.http_post(fields)

    if request.response_code == 200
      parsed = JSON.parse request.body_str
      return parsed["data"].join(",")
    end

    request.close
    ####End of Http Request

    template = "session/patient_session"

    render :template => template
  end

  def getTherapistVSeeURI(therapist_id, client_id)

    commands ={"commands"     => [
        {"setUser"   => {"username" => "etherapi+#{therapist_id}", "password" => '%etherapi%'}},
        {"callAutoAccept"     => {"enabled" => true, "username" => "etherapi+#{client_id}"}},
        {"setAddressBook"     => {"enabled" => true}},
        {"setFirstTutorial"   => {"enabled" => false}},
        {"setOutlookImport"   => {"enabled" => false}},
        {"setCallSurvey"      => {"enabled" => false}},
        {"setHistory"         => {"enabled" => false}},
        {"setVideoWindow"     => {"username" => "etherapi+#{therapist_id}", "x" =>50, "y" => 200, "width" => Width_perc_value_username, "height" => Height_perc_value_username, "pinned" => true}},
        {"setVideoWindow"     => {"username" => "etherapi+#{client_id}", "x" => Width_perc_value_username+200, "y" => Height_perc_value_username+50, "width" => Width_perc_value_tocall, "height" => Height_perc_value_tocall, "pinned" => true}}
      ]
    }
    init = {"init" => commands}
    #waitcall = {"waitForCall" => {"timeout" => 1000, "autoaccept" => true, "acceptuser" => "etherapi+#{@client_id}"}}
    startcall = {"startCall" => {"username" => "etherapi+#{client_id}", "timeout" => 3600}}
    fields = {"secretkey" => Secretkey, "uris" => [[init, startcall]]}
    #puts commands
    user_json = JSON.generate(fields)
    #puts user_json

    ####Start of HTTP Request
    url = "https://api.vsee.com/uri/create?apikey=" + Apikey
    headers = {}
    headers["Accept"] = "application/json"
    headers["Content-Type"] = "application/json"
    request = Curl::Easy.new
    request.url = url
    request.verbose = true
    request.headers=headers
    request.ssl_verify_peer = false
    request.ssl_verify_host = false
    #request.ssl_version
    #request.useragent = "Ruby/Curb"


    request.http_post(fields)

    if request.response_code == 200
      parsed = JSON.parse request.body_str
      return parsed["data"].join(",")
    end

    request.close
    ####End of Http Request
  end

  # to be called to exit VSee for both patient and therapist
  def getVSeeExitURI()

    exit = {"exit" => {}}
    fields = {"secretkey" => Secretkey, "uris" => [[exit]]}

    user_json = JSON.generate(fields)

    ####Start of HTTP Request
    url = "https://api.vsee.com/uri/create?apikey=" + Apikey
    headers = {}
    headers["Accept"] = "application/json"
    headers["Content-Type"] = "application/json"
    request = Curl::Easy.new
    request.url = url
    request.verbose = true
    request.headers=headers
    request.ssl_verify_peer = false
    request.ssl_verify_host = false
    #request.ssl_version
    #request.useragent = "Ruby/Curb"

    request.http_post(fields)

    if request.response_code == 200
      parsed = JSON.parse(request.body_str).to_h
    end

    request.close
    ####End of Http Request
    respond_to do |format|
      format.html {render action: dashboards}
      format.json {render json: {data: parsed["data"][0]}}
    end

  end

  ##
  # Private session_log - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Use to share common setup or constraints between actions.
  #
  # Strong Parameter white list of parameters. Primarily defined in the Patient model, for reusability.
  def session_log_params
    params.require(:session_log).permit(SessionLog.session_log_whitelist)
  end

  private

  ##
  # Private convert_appointment_to_hash - Convert the model relation to an hash and adds the patient and therapist info to the appointment
  #
  #
  def convert_appointment_to_hash(appointment)
    appointment = appointment.serializable_hash
    if !appointment["patient_id"].blank?
      p = Patient.find(appointment["patient_id"])
      appointment["patient"] = p
      appointment["patient_name"] = p.first_name + " " + p.last_name
      appointment["start_time"] = appointment["start_time"].strftime("%T")
      appointment["end_time"] =  appointment["end_time"].strftime("%T")
      insurance = PatientInsurance.find_by_patient_id(appointment["patient_id"])
      appointment["patient_insurance"] = insurance
    end
    # get therapis is used for patient appointment
    if !appointment["therapist_id"].blank?
      p = Therapist.find(appointment["therapist_id"])
      appointment["therapist"] = p
      appointment["therapist_name"] = p.first_name + " " + p.last_name
    end
    appointment
  end
end
