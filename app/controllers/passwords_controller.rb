##
# Passwords Controller.
#
# This controller overrides Devise::PasswordsController to always return TRUE to valid_captcha?
#
# Override the valid_captcha? to always return true since we are not using captcha. Required for Security_Questionnable
#
class PasswordsController < Devise::PasswordsController
	before_filter  :add_gon
  def valid_captcha?(param)
    true
  end

  ## this method prevent error undefined gon
  def add_gon
  	gon.push({})
  end
  def create
    self.resource = resource_class.send_reset_password_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      # respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
      respond_with resource, location: root_path(resource)
    else
      return render json: {:status => 422, :success => false, :message => "user with #{params[:user][:email]} is not exist."}
    end
  end

  # GET /user/password/edit?reset_password_token=abcdef
  def edit
    self.resource = resource_class.new
    resource.reset_password_token = params[:reset_password_token]
  end

  # PUT /user/password
  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    # yield resource if block_given?
    if resource.errors.empty?
      sign_in(resource)
      return render json: {:status => 200, :success => true}
    else
      # respond_with resource
      return render json: {:status => 422, :success => false, :message => resource.errors.messages }
    end
  end

end