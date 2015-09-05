class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_filter :verified_request?

  #Before precess filters
  before_filter :devise_filter, if: :devise_controller?

  # CanCan rescue - if there's an Access Denied go to root, display the message
  rescue_from CanCan::AccessDenied do |exception|
    puts "### Security error: Access Denied Error #{exception.inspect} ###"
    respond_to do |format|
      format.html { redirect_to :dashboards}
      format.json { render :status => 401, :json => { :success => false, :alert => exception.message} }
    end
  end

  # *** Filters definition start

  #Devise filter
  def devise_filter
    logger.debug("In devise_filter =>PARAMS: #{params.inspect}")

    # White list for sign_up
    devise_parameter_sanitizer.for(:sign_up) { |u| u.permit(user_whitelist) }

    # White list for account update
    devise_parameter_sanitizer.for(:account_update) { |u| u.permit(user_whitelist, :current_password) }

    # White list for Invitation creation
    devise_parameter_sanitizer.for(:invite) { |u| u.permit(:account_type, :email, :invitation_token)}

    # White list for accept invitation
    devise_parameter_sanitizer.for(:accept_invitation) { |u| u.permit(user_whitelist, :invitation_token)}

  end

  # *** Filter definition end

  def _remove_after_invite_path_for(resource)
    #dashboards_path
  end

  def _remove_after_accept_path_for(resource)
    #patient_profile_steps_path
  end

  # *** Strong parameters definition start

  #Definition of the strong parameters for users
  def user_whitelist
    return [:user_id, :first_name, :last_name, :email, :account_type, :password, :password_confirmation, :security_question_id, :security_question_answer]
  end

  # *** Strong parameters definition end

  def authenticate_admin_user!
    redirect_to new_user_session_path unless current_user.try(:is_admin?)
  end


  def verified_request?
    if request.content_type == "application/json"
    true
    else
    super()
    end
  end

end