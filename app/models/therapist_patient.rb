class TherapistPatient < ActiveRecord::Base
  require 'composite_primary_keys'

  self.primary_keys = :therapist_user_id, :patient_user_id
  
  def self.get_my_patients(user_id)
    return Patient.joins('LEFT OUTER JOIN therapist_patients ON patients.user_id = therapist_patients.patient_user_id')
    .where('therapist_patients.accepted_on IS NOT NULL and therapist_patients.therapist_user_id = ?', user_id)
  end

  def self.get_my_therapists(user_id)
    return Therapist.joins('LEFT OUTER JOIN therapist_patients ON therapists.user_id = therapist_patients.therapist_user_id')
    .where('therapist_patients.accepted_on IS NOT NULL and therapist_patients.patient_user_id = ?', user_id)
  end

  def self.get_my_invitations(user_id)
    return Therapist.joins('LEFT OUTER JOIN therapist_patients ON therapists.user_id = therapist_patients.therapist_user_id')
    .where('therapist_patients.accepted_on IS NULL and therapist_patients.patient_user_id = ?', user_id)
  end

  def self.accept_invitation(therapist_user_id, patient_user_id)
    @tp = TherapistPatient.find(therapist_user_id, patient_user_id)
    return @tp.update_attribute(:accepted_on, Time.now)
  end

  def self.has_relation?(therapist_user_id, patient_user_id)
    TherapistPatient.exists?(['therapist_user_id = ? and patient_user_id = ?', therapist_user_id, patient_user_id])
  end

end
