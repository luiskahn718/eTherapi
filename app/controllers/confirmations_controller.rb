##
# Confirmation Controller.
#
# This controller overrides Devise::ConfirmationsController to always return TRUE to valid_captcha?
#
# Override the valid_captcha? to always return true since we are not using captcha. Required for Security_Questionnable
#
class ConfirmationsController < Devise::ConfirmationsController
  def valid_captcha?(param)
    true
  end
  def new
    super
  end

  def create
    super
  end

  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    if resource.errors.messages.empty?
      set_flash_message(:notice, :confirmed)
      # sign_in(self.resource) # do not signin

      ### after confirm, the backend create therapist or patient base on account_type
      ## here is the quick fix for our issuse
      ## will note and need confirm soon.
      # if self.resource.account_type.downcase == "therapist"
      #   ### create therapist VSee account
      #   create_vsee_acct(self.resource)
      #   therapist = Therapist.create :user_id => self.resource.user_id, :first_name => self.resource.first_name, :last_name => self.resource.last_name, :gender => "M", :timezone => "Pacific/Honolulu"
      #   therapist.save(validate: false)
      # elsif self.resource.account_type.downcase == "patient"
      #   ### create patient VSee account
      #   create_vsee_acct(self.resource)
      #   patient = Patient.create :user_id => self.resource.user_id, :first_name => self.resource.first_name, :last_name => self.resource.last_name,  :gender => "M", :timezone => "Pacific/Honolulu", :date_of_birth => Time.now - SecureRandom.random_number(50).year
      #   patient.save(validate: false)
      # end
      # redirect_to  therapist_searchresult_path
      redirect_to root_path(verify: form_authenticity_token)
    else
    	set_flash_message(:error, :confirm_token_invalid)
    	redirect_to root_path
    end
  end




  ##################
  ## we move create_vsee_acct in confirm here
  ## for check VSee
  ## will confirm the logic of flow and refactor.
  def create_vsee_acct(logged_user)
    puts '----------------------CREATE VSEE ACCT--------------------------'
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

    if request.response_code == 200
     parsed = JSON.parse request.body_str
     puts parsed.inspect
    end

    request.close
  ####End of Http Request
  end

end
