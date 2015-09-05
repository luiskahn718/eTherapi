class PatientProfileStepsController < ApplicationController
  include Wicked::Wizard
  
  before_filter :authenticate_user!
  authorize_resource :class => false
  
  steps :about_you, :address, :insurance
  #:about_you is for the demographic information, languages
  #:address is for the addresses of the therapist
  #:practice is for the llicenses, insurance state of practice
  #:background if for the bio of the therapist
  
  
  def show
    @user = current_user
    @patient = @user.getProfileable 
    render_wizard
  end
  
  def update
    @user = current_user
    @patient = @user.getProfileable
    
    if params[:id] == :insurance
      @patient.patient_insurance.build
    end 
    
    if @patient.user_id == nil
      @patient.user_id = @user.user_id
    end
     
    @patient.update_attributes(patient_params)
    render_wizard @patient
    
  end
  
private

  def redirect_to_finish_wizard(options = nil)
    redirect_to dashboards_path, notice: "Thank you for signing up."
  end
  
  # Strong Parameter white list of parameters. Primarily defined in the Patient model, for reusability.
  def patient_params
    params.require(:patient).permit(Patient.patient_whitelist, patient_insurance_attributes:Patient.patient_insurance_whitelist)
  end
end