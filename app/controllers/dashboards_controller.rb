class DashboardsController < ApplicationController
  before_filter :authenticate_user!
  authorize_resource :class => false
  def index
    @user = current_user
    @conversations = @user.mailbox.conversations
    if @user.is_admin?
      template = "dashboards/admin_dashboard"
    elsif @user.is_patient?
      @profile = Patient.where("user_id = ?", @user.user_id).first
      @my_invitations = TherapistPatient.get_my_invitations(@user.user_id)
      if !@profile.blank?
        @my_therapists = TherapistPatient.get_my_therapists(@user.user_id)
        @my_appointments = Appointment.where("patient_id = ?", @profile.id)
      end

      template = "dashboards/patient_dashboard"
    elsif @user.is_therapist?
      @profile = Therapist.where("user_id = ?", @user.user_id).first
      if !@profile.blank?
        @my_patients = TherapistPatient.get_my_patients(@user.user_id)
        @my_appointments = Appointment.where("therapist_id = ?", @profile.id)
      end

      template = "dashboards/therapist_dashboard"
    else
      raise 'Unknown user account type'
    end

    render :template => template
  end
end
