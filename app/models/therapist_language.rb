class TherapistLanguage < ActiveRecord::Base
  belongs_to :therapist, :foreign_key => 'therapist_id'

  def display_name
    LanguageCde.find(self.language_cde).display_name
  rescue
    ""
  end

end
