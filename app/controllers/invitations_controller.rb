##
# Invitation Controller.
#
# This controller overrides the default Devise::InvitationsController.
#
# Using the GEM Mailboxer
#
# [Ability Configuration]
#   Since invitation is derived of Devise::InvitationsController. the ability falls under users.
#
class InvitationsController < Devise::InvitationsController
  ##
  # Create an invitation
  #
  #   The default invitation behavior of Devise is to verify if the email provided exist in the Users model
  #   and to make a decision to reject the invitation or send an email based on this condition.
  #
  #   The eTherapi override will accept all invitations.
  #   If the email doesn't exist the Devise behavior is kept.
  #   If the email already exist the logic is to :
  #   * Verify if the relationship already exist with the current user
  #     * If the relationship exist return a message
  #     * If the relationship does NOT exist; the relationship is created
  #
  # [Required field :]
  #
  # Called from the Route : +user_invitation+ | POST | /users/invitation(.:format) | invitations#create
  #
  # Calls template : Redirect to +dashboards+
  #
  # [Returns]
  #    * errors
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {"user":{"email":"poutine@patate.com"}}
  #
  def create
    patient_user = User.find_by_email(params[:user][:email])

    if patient_user.blank?
      if params[:user][:account_type].blank?
        params[:user][:account_type] = 'Patient'
      end
    super
    else
      if params[:user][:account_type].blank?
        params[:user][:account_type] = 'Patient'
      end
      
      if TherapistPatient.has_relation?
        #outbound.io-event
        respond_to do |format|
          format.html { redirect_to new_user_invitation_path, action: 'create', notice: "This patient is already in your practice..."}
          format.json { render json:  { :errors => "This patient is already in your practice..." }, status: 409 }
        end
        return

      else
        therapist_patient = TherapistPatient.new
        therapist_patient.therapist_user_id = current_user.user_id
        therapist_patient.patient_user_id = patient_user.user_id
        therapist_patient.start_date = Time.now
        therapist_patient.save!
        #outbound.io-event
        respond_to do |format|
          format.html { redirect_to dashboards_path, action: :create, notice: "Successfully sent invitation to patient..."}
          format.json { render :status => 200, :json => { action: :create, notice: "Successfully sent invitation to patient..."}}
        end
        return
      end
    end
  end

end
