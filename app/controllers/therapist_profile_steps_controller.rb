class TherapistProfileStepsController < ApplicationController
  include Wicked::Wizard

  before_filter :authenticate_user! 
 
  authorize_resource :class => false
  
  steps :about_you, :address, :practice, :background
  #:about_you is for the demographic information, languages
  #:address is for the addresses of the therapist
  #:practice is for the llicenses, insurance state of practice
  #:background if for the bio of the therapist
  
  
  def show
    @user = current_user
    @therapist = @user.getProfileable 
    render_wizard
  end
  
  def update
    @user = current_user
    @therapist = @user.getProfileable
    if @therapist.user_id == nil
      @therapist.user_id = @user.user_id
    end 
    puts therapist_params
    @therapist.update_attributes(therapist_params)
    render_wizard @therapist
  end
  
  
private

  def redirect_to_finish_wizard(options = nil)
    redirect_to dashboards_path, notice: "Thank you for signing up."
  end
  
  # Strong Parameter white list of parameters. Primarily defined in the Therapist model, for reusability.
  def therapist_params
    params.require(:therapist).permit(Therapist.therapist_whitelist, 
      therapist_profile_attributes:Therapist.therapist_profile_whitelist, 
      therapist_language_attributes:Therapist.therapist_language_whitelist, 
      therapist_license_attributes:Therapist.therapist_license_whitelist, 
      therapist_speciality_attributes:Therapist.therapist_speciality_whitelist, 
      therapist_accept_insurance_attributes:Therapist.therapist_insurance_whitelist)
  end
end