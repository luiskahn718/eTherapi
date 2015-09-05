class PatientConsent < ActiveRecord::Base
  belongs_to :patient, :foreign_key => 'patient_id'
  
  def self.acknownledge(therapist_id, patient_id, consent_version)
    consent = PatientConsent.new
    consent.patient_id = patient_id
    consent.therapist_id = therapist_id
    consent.consent_version = consent_version
    consent.consent_datetime = Time.now
    consent.save
  end
end
