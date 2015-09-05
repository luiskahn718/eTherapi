class SessionsController < Devise::SessionsController
  respond_to :json, :html
  respond_to :xml, only: []
  def create
    begin
      logged_user = warden.authenticate!(:scope => resource_name, :recall => "#{controller_path}#failure")

      profileable = logged_user.getProfileable #Should we use logged_user.profileable, taking advantage of the relationship

      # first_login is use for detect user is the first login or not
      first_login = false

      if logged_user.is_therapist?
        if profileable.therapist_id.blank?  ## first loggin
          create_vsee_acct(logged_user)
          ### create therapist
          therapist = Therapist.create :user_id => logged_user.user_id, :first_name => logged_user.first_name, :last_name => logged_user.last_name
          therapist.save
          first_login = true
        else ## second loggin rediret to appointment
          # Validating Therapist licenses
          therapist = Therapist.find_by_user_id(logged_user.id)
          therapist.notify_expired_licenses(logged_user)
          first_login = false
        end
      elsif logged_user.is_patient?
        if profileable.patient_id.blank? ## first loggin
          create_vsee_acct(logged_user)
          patient = Patient.create :user_id => logged_user.user_id, :first_name => logged_user.first_name, :last_name => logged_user.last_name
          patient.save
          first_login = true
        else ## second login
          first_login = false
        end
      end
      #### get patientlist for therapist when login success
      @patientlist = []
      if logged_user.is_therapist?
        @patientlist = TherapistPatient.get_my_patients logged_user.user_id
      end

      respond_to do |format|
        format.html { redirect_to :dashboards}
        format.json { render :status => 200, :json => { :success => true, :info => "Logged in", :user => current_user, :profile => current_user.getProfileable, :patientlist => @patientlist, :first_login => first_login } }
      end
    rescue
      respond_to do |format|
        format.html { redirect_to :dashboards}
        format.json { render :status => 500, :json => { :success => false, :info => "Login Failed"} }
      end
    end

  end

  def destroy
    warden.authenticate!(:scope => resource_name, :recall => "#{controller_path}#failure")
    sign_out
    respond_to do |format|
      format.html { redirect_to :root}
      format.json { render :status => 200,
                    :json => { :success => true,
                               :info => "Logged out",
                               }}
    end
  end

  def failure
    respond_to do |format|
      format.html { redirect_to :user_session}
      format.json {  render :status => 401,
                     :json => { :success => false,
                                :info => "Login Credentials Failed"
                                }}
    end
  end

  def show_current_user
    warden.authenticate!(:scope => resource_name, :recall => "#{controller_path}#failure")
    render :status => 200,
      :json => { :success => true,
                 :info => "Current User",
                 :user => current_user
                 }

      end

  def create_vsee_acct(logged_user)
    apikey = "3dbledogijxvbbmfhlrfkixhvzr6mmphaybyphjrpqcyr8vu7dxy1gow4udj6rcg"
    secretkey = "cksvpmkoju3a36r1gsbr3zksjjmtvxjzdxphbgdy3nguvbcvw7gznd0ljkmdxwwi"

    prefix = 'd' unless Rails.env.production?
    username = prefix + logged_user.user_id.to_s

    data = {
      "secretkey" => secretkey,
      "username"  => username,
      "password"  => "%etherapi%",
      "fn"        => logged_user.first_name,
      "ln"        => logged_user.last_name
    }
    puts data.inspect

    ####Start of HTTP Request
    url = "https://api.vsee.com/user/create?apikey=" + apikey
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

    request.http_post(data)

    puts '##############################'
    puts '#########################'

    if request.response_code == 200
      puts request.inspect
      parsed = JSON.parse request.body_str
      puts parsed.inspect
    end

    request.close
    ####End of Http Request
  end

end
