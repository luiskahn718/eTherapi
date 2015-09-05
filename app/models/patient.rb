class Patient < ActiveRecord::Base

  after_save :after_save_patient

  #Relationships
  has_one :user, :as => :account, :foreign_key => 'user_id'
  has_many :therapist_patient
  has_many :patient_insurance
  has_many :patient_consent
  has_many :appointment

  # accepts_nested_attributes_for :patient_insurance, reject_if: :insurance_blank, :allow_destroy => true
  # check reject_if in this case
  accepts_nested_attributes_for :patient_insurance, :allow_destroy => true

  mount_uploader :picture_filelink, AvatarUploader
  #mount_uploader :thumbnail_filelink, ThumbnailUploader

  # *** Strong parameters definition start

  #Definition of the strong parameters for patient
  def self.patient_whitelist
    return [:user_id, :first_name, :last_name, :middle_name, :nick_name, :gender, :ssn, :timezone, :date_of_birth, :language,
      :address1, :address2, :city, :state_cde, :country_cde, :zipcode, :postal_code, :phone_mobile, :phone_home, :phone_work,
      :mail_address1, :mail_address2, :mail_city, :mail_state_cde, :mail_country_cde, :mail_zipcode, :medical_history, :picture_filelink, :thumbnail_filelink, :emergency_contact_name, :emergency_contact_phone_no, :emergenyc_contact_relationship] ## add emergency_contact_name, :emergency_contact_phone_no, :emergenyc_contact_relationship to whitelist
  end

  def self.patient_insurance_whitelist
    return [:patient_insurance_id, :patient_id, :seq, :insurance_payer_id, :policy_number, :group_number, :group_name, :subscriber_id, :subscriber_last_name, :subscriber_first_name, :subscriber_dob, :subscriber_address1, :subscriber_address2, :subscriber_city, :subscriber_state_cde, :subscriber_zipcode, :subscriber_country_cde, :subscriber_relationship, :plan_name, :_destroy,  :id] ## add plan_name, patient_insurance_id to whilelist
  end

  # *** Strong parameters definition end

  # *** Record Validation Start

  validates_presence_of :last_name, :first_name#, :date_of_birth, :gender

  def insurance_blank(c)
    valid? && c[:policy_number].blank?
  end
  # *** Record Validation End

  def id
    self.patient_id
  end

  def user
    User.find(self.user_id)
  end

  def display_name
    self.last_name + ', ' + self.first_name
  end

  def after_save_patient
    user = User.find(self.user_id)
    tp_relation = TherapistPatient.where("therapist_user_id = ? AND patient_user_id = ?", user.invited_by_id, user.user_id)
    if !user.invited_by_id.blank? && tp_relation.blank?
      therapist_patient = TherapistPatient.new
      therapist_patient.therapist_user_id = user.invited_by_id
      therapist_patient.patient_user_id = user.user_id
      therapist_patient.start_date = Time.now
      therapist_patient.accepted_on = Time.now
      therapist_patient.save!
    end
  end
end
