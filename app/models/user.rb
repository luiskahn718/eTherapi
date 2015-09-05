class User < ActiveRecord::Base

  acts_as_messageable
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :confirmable, :security_questionable

  # Validation
  validates_presence_of :email, :first_name, :last_name, :account_type
  validates_uniqueness_of :email, :case_sensitive => false
  validates_confirmation_of :password

  #Polymorphic Relationship
  belongs_to :account, :polymorphic => true

  # activerecord callbacks
  after_save :signup_outbound

  # Get the polymorphic profileable from the account type, if the profileable doesn't exist return a new profileable
  def getProfileable
    if self.is_therapist?
      therapist = Therapist.where(["user_id = ?", self.user_id]).first
      if therapist
      profileable = therapist
      else
        profileable = Therapist.new
      profileable.first_name = self.first_name
      profileable.last_name = self.last_name
      end

    elsif self.is_patient?
      patient = Patient.where(["user_id = ?", self.user_id]).first
      if patient
      profileable = patient
      else
        profileable = Patient.new
      profileable.first_name = self.first_name
      profileable.last_name = self.last_name
      end
    elsif self.is_admin?
    profileable = self
    end
    return profileable
  end

  def is_therapist?
    self.account_type.downcase == 'therapist'
  end

  def is_admin?
    self.account_type.downcase == 'admin'
  end

  def is_patient?
    self.account_type.downcase == 'patient'
  end

  def display_name
    self.email
  end

  def after_save_user
    # update outbound mail with new user information
    if self.email_changed? || self.first_name_changed? || self.last_name_changed?
      Outboundmail.register_user(self)
    end
  end

  # Mailboxer required definition

  #Returning any kind of identification you want for the model
  def name
    return self.user_id
  end

  #Returning the email address of the model if an email should be sent for this object (Message or Notification).
  #If no mail has to be sent, return nil.
  def mailboxer_email(object)
    puts "mailboxer_email #{object.inspect}"
    #Check if an email should be sent for that object
    return self.email
  end

  private
  #  Create outbound_admin_notification and outbound_event
  def signup_outbound
    if self.confirmed_at_changed?
      Outboundmail.register_user(self)
      event_properties = {:user => self}
      Outboundmail.outbound_admin_notification("sign_up", self, event_properties)
      Outboundmail.outbound_event("sign_up", self, event_properties)
    end
  end
end
