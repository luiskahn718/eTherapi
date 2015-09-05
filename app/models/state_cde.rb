class StateCde < ActiveRecord::Base
  
  def display_name
    self.abbreviation
  end
end
