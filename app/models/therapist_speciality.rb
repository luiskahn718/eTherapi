class TherapistSpeciality < ActiveRecord::Base
  belongs_to :therapist, :foreign_key => 'therapist_id'
  
  def display_name
    SpecialityCde.find(self.speciality_id).display_name
  end
end
