class Note < ActiveRecord::Base
  belongs_to :therapist, :foreign_key => 'therapist_id'

  # Scope definition - Scope by definition are loaded when the app loads, so when paramenters are passed we use lambda which is always reexecuted
  scope :session, ->{where("note_type = 'session'")}
  scope :progress, ->{where("note_type = 'progress'")}
  scope :patient, ->{where("note_type = 'patient'")}
  ### add new additional
  scope :additional, ->{where("note_type= 'additional'")}

  scope :session_notes, ->(session_id){where( "session_id = ?", session_id)}
  scope :patient_note_for_type, ->(therapist_id, patient_id, note_type){where( "therapist_id = ? and patient_id = ? and note_type = ?", therapist_id, patient_id, note_type )}
  scope :patient_notes, ->(therapist_id, patient_id){where( "therapist_id = ? and patient_id = ?", therapist_id, patient_id )}


end
