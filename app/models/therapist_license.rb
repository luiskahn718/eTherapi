class TherapistLicense < ActiveRecord::Base
  belongs_to :therapist, :foreign_key => 'therapist_id'
  after_save :outbound_save_notification

  def display_name
    self.state + ', ' + self.license_number
  end

  def expired?
    self.verified? && self.end_date < Date.today
  end

  def verified?
    self.verified_by && self.verified_date <= Date.today
  end

  def outbound_save_notification
    user = User.find(self.therapist.user_id)
    payload = {:user => user, :license => self}
    Outboundmail.outbound_admin_notification('update_license', user, payload)
  end
end
