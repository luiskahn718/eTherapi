class SecurityQuestion < ActiveRecord::Base
  
  def display_name
    self.question
  end
end
