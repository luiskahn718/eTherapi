class Appointment < ActiveRecord::Base
  belongs_to :therapist
  belongs_to :patient

  # activerecord callbacks
  after_create :send_outbound_create_event
  after_save :send_outbound_status_update_event
  attr_accessor :consent

  # scope :therapist_up_comming, ->(owner_id, profile_id, date, date_appointment, start_time) { where("status = 'c' and (owner_id = ? OR therapist_id = ?) and (  ( date > ? ) or ( date = ? AND start_time > ? ) )", owner_id, profile_id, date, date_appointment, start_time) }
  # scope :patient_up_comming, ->(owner_id, profile_id, date, date_appointment, start_time) { where("status = 'c' and (owner_id = ? OR patient_id = ?) and (  ( date > ? ) or ( date = ? AND start_time > ? ) )", owner_id, profile_id, date, date_appointment, start_time) }

  # scope :therapist_request, ->(owner_id, profile_id, date, date_appointment, start_time) { where("status = 'p' and (owner_id = ? OR therapist_id = ?) and (  ( date > ? ) or ( date = ? AND start_time > ? ) )", owner_id, profile_id, date, date_appointment, start_time) }
  # scope :patient_request, ->(owner_id, profile_id, date, date_appointment, start_time) { where("status = 'p' and (owner_id = ? OR patient_id = ?) and (  ( date > ? ) or ( date = ? AND start_time > ? ) )", owner_id, profile_id, date, date_appointment, start_time) }

  # scope :therapist_past_or_cancel, ->(owner_id, profile_id, day1, day2, end_time) { where("(owner_id = ? OR therapist_id = ?) and ( status = 'd' or ( status <> 'd' and (  ( date < ? ) or ( date = ? AND end_time < ? ) )  ) )", owner_id, profile_id, day1, day2, end_time) }
  # scope :patient_past_or_cancel, ->(owner_id, profile_id, day1, day2, end_time) { where("(owner_id = ? OR patient_id = ?) and ( status = 'd' or ( status <> 'd' and (  ( date < ? ) or ( date = ? AND end_time < ? ) )  ) )", owner_id, profile_id, day1, day2, end_time) }

  # Scope definition - Scope by definition are loaded when the app loads, so when paramenters are passed we use lambda which is always reexecuted
  scope :confirmed, ->{where("status = 'c'")}
  scope :pending, ->{where("status = 'p'")}
  scope :deleted, ->{where("status = 'x'")}
  scope :declined, ->{where("status = 'd'")}
  scope :declined_deleted, ->{where("status = 'd' or status = 'x'")}
  scope :up_coming, ->(current_day, current_time){where( "(date > ? ) or ( date = ? AND end_time > ? )", current_day, current_day, current_time)}
  scope :past_or_cancel, ->(current_day, current_time){where( "status = 'x' or ( status = 'c' and (( date < ? ) or ( date = ? AND end_time < ? )))", current_day, current_day, current_time)}


  scope :patient, ->(user_id, profile_id) {where("owner_id = ? OR patient_id = ?", user_id, profile_id )}
  scope :patient_all_confirmed, ->(user_id, profile_id) {confirmed.patient(user_id, profile_id)}
  scope :patient_request, ->(user_id, profile_id, current_day, current_time) {pending.up_coming(current_day, current_time).patient(user_id, profile_id )}
  scope :patient_up_coming, ->(user_id, profile_id, current_day, current_time) {confirmed.up_coming(current_day, current_time).patient(user_id, profile_id )}
  scope :patient_past_or_cancel, ->(user_id, profile_id, current_day, current_time) {past_or_cancel(current_day, current_time).patient(user_id, profile_id )}
  scope :patient_declined, -> (user_id, profile_id) { declined.patient(user_id, profile_id) }

  scope :therapist, ->(user_id, profile_id) {where("owner_id = ? OR therapist_id = ?", user_id, profile_id )}
  scope :therapist_all_confirmed, ->(user_id, profile_id) {confirmed.therapist(user_id, profile_id)}
  scope :therapist_request, ->(user_id, profile_id, current_day, current_time) {pending.up_coming(current_day, current_time).therapist(user_id, profile_id )}
  scope :therapist_up_coming, ->(user_id, profile_id, current_day, current_time) {confirmed.up_coming(current_day, current_time).therapist(user_id, profile_id )}
  scope :therapist_past_or_cancel, ->(user_id, profile_id, current_day, current_time) {past_or_cancel(current_day, current_time).therapist(user_id, profile_id )}
  scope :therapist_declined, -> (user_id, profile_id) { declined.therapist(user_id, profile_id) }

  scope :recents, -> { order('date DESC').order('start_time DESC') }

  EVENT_STATUS = {
    "d" => "declined",
    "c" => "accepted",
    "x" => "canceled"
  }

  def display_name
    self.date
  end

  def invitees
    owner = User.find(self.owner_id)
    list = Array.new
    if owner.is_patient?
      list.push Therapist.find(self.therapist_id)
    end

    if owner.is_therapist?
      if !self.patient_id.blank?
        list.push Patient.find(self.patient_id)
      end
    end
    return list
  end

  def get_therapist_user_id
    #self.therapist_id
    therapist = Therapist.find(self.therapist_id)
    return therapist[:user_id]
  end

  def get_patient_user_id
    #self.patient_id
    patient = Patient.find(self.patient_id)
    return patient[:user_id]
  end


  private
  # Send outbound event/message to therapist
  def send_outbound_create_event
    # check for the therapist associated with this appointment
    send_outbound_event("created")
  end

  def send_outbound_status_update_event
    # check for only status change
    if self.status_changed?
      send_outbound_event(EVENT_STATUS[self.status])
    end
  end

  def send_outbound_event(event_type)
    return unless event_type # do nothing if event_type is not provided
    if self.therapist
      user = User.find(self.therapist.user_id)
      payload = {:user => user, :appointment => self}
      Outboundmail.outbound_event("appointment_#{event_type}_therapist", user, payload)
    end
    if self.patient
      user = User.find(self.patient.user_id)
      payload = {:user => user, :appointment => self}
      Outboundmail.outbound_event("appointment_#{event_type}_patient", user, payload)
    end
  end
end
