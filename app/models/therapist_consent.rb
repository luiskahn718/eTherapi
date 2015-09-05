class TherapistConsent < ActiveRecord::Base
  belongs_to :therapist, :foreign_key => 'therapist_id'
   
end
