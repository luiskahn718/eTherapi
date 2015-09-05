class LanguageCde < ActiveRecord::Base
  def display_name
    self.language
  end
  
  def abbreviation
    self.language_code.to_s
  end
  
end
