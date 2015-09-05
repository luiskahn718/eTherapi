class TherapistProfile < ActiveRecord::Base
  belongs_to :therapist, :foreign_key => 'therapist_id'
  after_create :profile_after_create

  def profile_after_create
    # update outbound mail
    # payload = {:user => self}
    # Outboundmail.outbound_admin_notification('profile_created', , payload)
  end

  def self.get_therapist_from_pub_key(pub_key)
    TherapistProfile.where(:calendar_sharing_key  => pub_key).first.therapist_id
  end
end
