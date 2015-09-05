class UsersController < ApplicationController

  before_filter :authenticate_user!
  #authorize_resource :class => false
  load_and_authorize_resource
  def show
    @user = User.find(params[:id])
  end

  def admin_reset_password
    user = User.find(params[:user_id])
    if user.update_attributes(password_param)
      flash[:notice] = "Password resetted."
    else
      flash[:danger] = "Unable to save the password."
    end
    redirect_to :back
  end

  ##relate: https://github.com/plataformatec/devise/wiki/How-To:-Allow-users-to-edit-their-password
  def update_password
    @user = User.find(current_user.id)
    respond_to do |format|
      if @user.update_attributes(password_param)
        # Sign in the user by passing validation in case his password changed
        sign_in @user, :bypass => true
        format.json { render :status => 200, :json => { action: :updated, user: @user}}
      else
        format.json { render json: @user.errors.full_messages, status: :unprocessable_entity }
      end
    end
  end

  ### add new update_account for update email, first_name, last_name
  def update_account
    @user = User.find(current_user.id)
    ### skip re sent email confirmation
    @user.skip_reconfirmation!
    respond_to do |format|
      if @user.update_attributes(user_param)
         # Sign in the user by passing validation in case his password changed
        sign_in @user, :bypass => true
        ## update last_name, first_name in profile too
        @profile = @user.getProfileable
        @profile.update_attributes({:first_name => @user.first_name, :last_name => @user.last_name})
        format.json { render :status => 200, :json => { action: :updated, user: @user}}
      else
        format.json { render json: @user.errors.full_messages, status: :unprocessable_entity }
      end
    end

  end

  def password_param
    params.permit(:password, :password_confirmation)
  end
  def user_param
    params.permit(:email, :first_name, :last_name)
  end

end
