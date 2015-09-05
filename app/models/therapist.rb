class Therapist < ActiveRecord::Base
  require 'ice_cube'
  include IceCube

  PER_PAGE_RECORDS = 10
  has_one :user, :as => :account, :foreign_key => 'user_id'
  has_one :therapist_profile, :foreign_key => 'therapist_id'


  #has_many :therapist_consent
  has_one :therapist_consent  # change to has_one
  has_many :therapist_speciality
  has_many :therapist_language
  has_many :therapist_license
  has_many :therapist_accept_insurance, :foreign_key => 'entity_id'
  # Need help to check
  #  has_many :therapist_accept_insurance, :as => :entity, :foreign_key => 'entity_id'  ## got error: Unknown column 'therapist_accept_insurances.entity_type' in 'where clause'
  has_many :therapist_availability
  has_many :therapist_availability_rec
  has_many :appointment
  has_many :note


  accepts_nested_attributes_for :therapist_speciality, reject_if: :speciality_blank, :allow_destroy => true
  accepts_nested_attributes_for :therapist_license, reject_if: :license_blank, :allow_destroy => true
  accepts_nested_attributes_for :therapist_language, reject_if: :language_blank, :allow_destroy => true
  # accepts_nested_attributes_for :therapist_accept_insurance, reject_if: :insurance_blank, :allow_destroy => true
  accepts_nested_attributes_for :therapist_accept_insurance, :allow_destroy => true
  accepts_nested_attributes_for :therapist_availability, reject_if: :availability_blank, :allow_destroy => true
  accepts_nested_attributes_for :therapist_availability_rec, reject_if: :recurring_availability_blank, :allow_destroy => true
  accepts_nested_attributes_for :therapist_profile, :allow_destroy => true
  accepts_nested_attributes_for :note, :allow_destroy => false

  mount_uploader :picture_filelink, AvatarUploader
  #mount_uploader :thumbnail_filelink, ThumbnailUploader

  # *** Strong parameters definition start

  #Definition of the strong parameters for therapist
  def self.therapist_whitelist
    return [:therapist_id, :user_id, :first_name, :last_name, :middle_name, :nick_name, :gender, :timezone, :npi_no,
      :address1, :address2, :city, :state_cde, :country_cde, :zipcode, :postal_code,
      :mail_address1, :mail_address2, :mail_city, :mail_state_cde, :mail_country_cde, :mail_zipcode,
      :phone_mobile, :phone_home, :phone_work, :session_duration, :normal_wrk_start_time, :normal_wrk_end_time,
      :picture_filelink, :thumbnail_filelink, :approval_status, :approval_date]
  end

  def self.therapist_language_whitelist
    return [:therapist_id, :language_cde, :language_code, :proficiency, :_destroy, :id]
  end

  def self.therapist_license_whitelist
    return [:therapist_id, :license_number, :state, :start_date, :license_type, :end_date, :_destroy, :id, :verified_by, :verified_date]
  end


  def self.therapist_profile_whitelist
    return [:id, :about_me, :education, :school, :prof_memberships, :experience_years,
      :hourly_rate_min, :hourly_rate_max, :interview_dt, :emergency_contact_rel, :emergency_contact_person, :emergency_contact_ph_number,
      :sliding_scale, :accept_new_patient, :viewable_on_search, :treatment_approach, :client_focus,
      :youtube_link, :web_uri_link, :hear_about_us_id, :tag_line, :demographics_served, :charge_for_cancellation, :additional_expertise, :ssn]  ### ADD additional_expertise in to profiles
  end

  def self.therapist_speciality_whitelist
    return [:therapist_id, :id, :speciality_id, :speciality_cde, :seq_speciality_cde, :_destroy]
  end

  def self.therapist_patient_whitelist
    return [:therapist_id, :patient_id, :start_date, :end_date, :reffered_by, :first_seen_date, :_destroy]
  end

  def self.therapist_availability_whitelist
    return [:id, :therapist_id, :date, :start_time, :end_time, :_destroy]
  end

  def self.therapist_recurring_whitelist
    return [:id, :therapist_id, :start_date, :end_date, :start_time, :end_time,
      :recurring_type, :daily_every_no_days, :daily_every_weekday, :weekly_sunday,
      :weekly_monday, :weekly_tuesday, :weekly_wednesday, :weekly_thursday, :weekly_friday, :weekly_saturday, :_destroy]
  end

  def self.therapist_insurance_whitelist
    return [:id, :entity_id, :therapist_id, :start_date, :end_date, :insurance_id, :insurance_payer_id, :contract_ref_no, :_destroy] ## add insurance_payer_id to whitelist
  end

  # *** Strong parameters definition end

  # *** Record Rejection Validation Start
  # validates_presence_of :gender, :timezone, :npi_no
  #validates_presence_of :gender, :timezone  #In database: npi_no: allow null/ default null, remove validate.

  validates_associated :therapist_availability_rec

  def license_blank(c)
    valid? && (c[:license_number].blank? || c[:state].blank?)
  end

  def insurance_blank(c)
    valid? && (c[:insurance_id].blank? || !Therapist.date_populated?(c, "start_date") )
  end

  def language_blank(c)
    valid? && c[:language_cde].blank?
  end

  def speciality_blank(c)
    valid? && (c[:speciality_id].blank? || c[:seq_speciality_cde].blank?)
  end

  def availability_blank(c)
    valid? && (!Therapist.date_populated?(c, "date") || !Therapist.time_populated?(c, "start_time") || !Therapist.time_populated?(c, "end_time"))
  end

  def recurring_availability_blank(c)
    valid? && (!Therapist.date_populated?(c, "start_date") || !Therapist.date_populated?(c, "end_date"))
  end

  # Zip Validation
  # http://stackoverflow.com/questions/6273814/conditional-validation-on-model-dependent-on-value-of-model-attribute

  # *** Record Rejection Validation End

  def get_availabilities
    #retrieve all availability
    self.therapist_availability.collect{ |availability| availability_start_end_datetime(availability.get_occurrences, availability) }.flatten
  end

  def get_recuring_availabilities
    get_recuring_availabilities(2000, 01)
  end

  def get_recuring_availabilities(year, month)
    #retrieve all Recurring availability Rule
    # schedules = Array.new
    # self.therapist_availability_rec.each do |availability|
    #   schedules.push availability.get_occurrences
    # end
    # schedules.flatten
    self.therapist_availability_rec.collect{ |availability| availability_start_end_datetime(availability.get_occurrences, availability) }.flatten
  end

  def get_all_availability
    get_recuring_availabilities.zip(get_availabilities).flatten.compact
  end

  def get_all_schedule
    schedules = Array.new
    self.therapist_availability_rec.each do |schedule|
      schedules.push schedule.get_schedule
    end

    self.therapist_availability.each do |schedule|
      schedules.push schedule.get_schedule
    end
    schedules
  end

  def getNextAvailability
    nexttime = Time.now + 12.months
    get_all_schedule.each do |schedule|
      nexttime = schedule.next_occurrence(Time.now) if nexttime > schedule.next_occurrence(Time.now)
    end
    nexttime
  end

  # Helpers
  def id
    self.therapist_id
  end

  def primary_speciality
    self.therapist_speciality.where("seq_speciality_cde = 1").first.display_name
  end

  def state
    StateCde.find(self.state_cde).display_name if !self.state_cde.blank?
  end

  def display_name
    self.last_name + ', ' + self.first_name
  end

  def name
    self.first_name + ' ' + self.last_name
  end

  def self.date_populated?(params, field_name)
    return false unless !params["#{field_name}"].blank?
    if params["#{field_name}"].include? '1i'
      return ['1i', '2i', '3i'].select{|date_part| params[:"#{field_name}(#{date_part})"].blank?}.blank?
    else
      return !params["#{field_name}"].blank?
    end
  end

  def self.time_populated?(params, field_name)
    return false unless !params["#{field_name}"].blank?
    if params["#{field_name}"].include? '1i'
      return ['1i', '2i', '3i', '4i', '5i'].select{|date_part| params[:"#{field_name}(#{date_part})"].blank?}.blank?
    else
      return !params["#{field_name}"].blank?
    end
  end

  def availability_start_end_datetime(occurrences, availability)
    availabilities = []
    appoitments = Appointment.where("status = 'c' and therapist_id = ?", self.therapist_id)
    appoitments.each do |appoitment|
      start_clock = appoitment.start_time.strftime("%H:%M:%S")
      end_clock = appoitment.start_time.strftime("%H:%M:%S")
      appt_start_time = Time.parse("{appoitment.date} #{start_clock}")
      appt_end_time = Time.parse("{appoitment.date} #{end_clock}")

      range = appt_start_time..appt_end_time
      occurrences.each do |occ|
        unless occ.intersects?(range)
          start_datetime = Time.parse "#{occ.to_date} #{availability.start_clock}"
          end_datetime = Time.parse("#{occ.to_date} #{availability.end_clock}")
          availabilities << { start_datetime: start_datetime, end_datetime: end_datetime}
        end
      end
    end
    return availabilities
  end

  def notify_expired_licenses(user)
    all_expired_licenses = self.expired_licenses
    unless all_expired_licenses.blank?
      payload = {:user => user, :licenses => all_expired_licenses}
      Outboundmail.outbound_event('expired_licenses', user, payload)
      Outboundmail.outbound_admin_notification('expired_licenses', user, payload)
    end
  end

  def expired_licenses
    self.therapist_license.select{|license| license if license.expired? }
  end
end
