class SessionLog < ActiveRecord::Base
  self.primary_key = "session_id"
  has_one :therapist, :foreign_key => 'therapist_id'
  has_one :patient, :foreign_key => 'patient_id'

  def self.session_log_whitelist
    return [:session_id, :appointment_id, :therapist_id, :therapist_start_time, :therapist_end_time,
      :patient_id, :patient_start_time, :patient_end_time, :multi_session_ind, :stripe_customer_id,
      :cpt_codes, :icd10_codes, :therapist_declared_duration, :service_provided_notes, :changed_fee_amt, :_destroy]
  end


  scope :get_session_id_from_appointment, ->(appointment_id){where( "appointment_id = ?", appointment_id)}
end
