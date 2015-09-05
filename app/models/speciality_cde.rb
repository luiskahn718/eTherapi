class SpecialityCde < ActiveRecord::Base
  #belongs_to :therapist_speciality
  
  def display_name
    self.name
  end
end
