##
# Appointment Controller.
# This controller is responsible for the managememt of all appoint functions
#
# Notes : Notes uses generalised concept around the follwing rules : 
# 1. Notes can only be created and viewed by therapist. (therapist_id - required at all time)
# 2. Only the therapist owner of the note can view and edit the note
# 3. Notes may or may not be tied to a patient (patient_id) 
# 4. Notes can be tied to a specific session (session_id)
# 5. Notes can have any types (note_type) for example "patient" type note is a generic note tied to the patient that is time independent, 
#     while "progress" note wouild be notes that are created over time for the patient. Session note would have a type of "session" and a session_id. That type of notes are tied to the session.
#     The design would allow to use different type of notes for a specific session.
#
# [Ability Configuration]
# * Therapist can
#   1. :index
#   2. :show
#   3. :update
#   4. :create
#
# * Patient can
#    NONE
#
class NotesController < ApplicationController
  skip_before_filter  :json_verify_authenticity_token
  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end

  before_filter :authenticate_user!
  authorize_resource :class => false

  ##
  # Show the detail of a specific note
  #
  # Called from the Route : +note+ | GET | /notes/:id(.:format) | notes#show
  #
  # Calls template : views/notes/show.html.haml
  #
  # [Returns]
  #   * @note
  #   * @user
  #   * @therapist
  #
  def show
    getProfile
    note = Note.find(params[:id])

    respond_to do |format|
      format.html { render action: 'show' }
      format.json { render :status => 200, :json => { action: 'show',
                    note: note, user: @user, profile: @therapist }}
    end
  end

  ##
  # Retrieve all patient notes
  #
  # [Required fields :]
  #   * :patient_id
  #
  # The type parameter must be passed as patient_id
  #
  # Example : http://localhost:3000/notes/get_patient_notes?patient_id=x
  #
  # Called from the Route : get | /notes/get_patient_notes(.:format) | notes#get_patient_notes
  #
  # Calls template : Redirect to +caller+
  #
  # [Returns]
  #   * @note
  #   * @user
  #   * @therapist
  #   * @patient - patient tied to the session_id passed
  #   * status - the status of the action
  #
  def get_patient_notes
    getProfile
    notes = Note.patient_notes(@therapist.therapist_id, params[:patient_id])
    process_notes(notes, :get_patient_notes, "Notes not found with the passed patient_id.")
  end

  ##
  # Retrieve all patient notes of the specified type
  #
  # [Required fields :]
  #   * :patient_id
  #   * :note_type
  #
  # The type parameter must be passed as patient_id=x&note_type=y.
  #
  # Example : http://localhost:3000/notes/get_patient_note_for_type?patient_id=x&note_type=y
  #
  # Called from the Route : get | /notes/get_patient_note_for_type(.:format) | notes#get_patient_note_for_type
  #
  # Calls template : Redirect to +caller+
  #
  # [Returns]
  #   * @note
  #   * @user
  #   * @therapist
  #   * @patient - patient tied to the session_id passed
  #   * status - the status of the action
  #
  def get_patient_notes_for_type
    getProfile
    notes = Note.patient_note_for_type(@therapist.therapist_id, params[:patient_id], params[:note_type])
    process_notes(notes, :get_patient_notes_for_type, "Notes not found with the passed patient_id & note_type.")
  end

  ##
  # Retrieve all session notes associated with the "id" passed
  #
  # [Required fields :]
  #   * :session_id
  #
  # The type parameter must be passed as session_id=x.
  #
  # Example : http://localhost:3000/notes/get_session_notes?session_id=x
  #
  # Called from the Route : get | /notes/get_session_notes(.:format) | notes#get_session_notes
  #
  # Calls template : Redirect to +caller+
  #
  # [Returns]
  #   * @note
  #   * @user
  #   * @therapist
  #   * @patient - patient tied to the session_id passed
  #   * status - the status of the action
  #
  def get_session_notes
    getProfile
    notes = Note.session_notes(params[:session_id])
    process_notes(notes, :get_session_notes, "Notes not found with the passed session_id.")
  end

  ##
  # Update an exsiting Note - Warning : The only field that should be updated is the Note field.
  #
  # [Required fields :]
  #   * :note
  #
  # Called from the Route : PUT | /notes/:id(.:format) | notes#update
  #
  # Calls template : Redirect to +caller+
  #
  # [Returns]
  #    * @note - the new note created
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {"note":{"note":"First JSON note"}}
  #
  def update
    @note = Note.find(params['id'])
    @note.note_datetime = Time.now
    if @note.update_attributes(note_params)
      respond_to do |format|
        format.html { render action: 'show', :notice =>  "Note updated."}
        format.json { render :status => 200, :json => { action: 'update', note: @note}}
      end
    else
      respond_to do |format|
        format.html { render action: 'edit', :notice =>  "Error updating note."}
        format.json { render :status => 500, :json => { action: 'create', note: @note}}
      end
    end
  end

  ##
  # Create a new Note
  #
  # [Required fields :]
  #   * :therapist_id
  #   * :patient_id
  #   * :note
  #   * :note_type - sugested values [patient, progress, session]
  #   * :session_type
  #
  # [Optional fields :]
  #   * :session_type - passed if the note is tied to a specific session
  #
  # Called from the Route : POST | /notes(.:format) | notes#create
  #
  # Calls template : Redirect to +caller+
  #
  # [Returns]
  #    * @note - the new note created
  #    * status - the status of the action
  #
  #  [JSON parameter format]
  #     {"note":{"therapist_id":"2", "patient_id":"3", "note":"First JSON note", "note_type":"progess"}}
  #
  def create
    @note = Note.find_or_initialize_by_id(params['id'])
    @note.note_datetime = Time.now
    if @note.update_attributes(note_params)
      respond_to do |format|
        format.html { render action: 'show', :notice =>  "Note saved."}
        format.json { render :status => 200, :json => { action: 'create', note: @note}}
      end
    else
      respond_to do |format|
        format.html { render action: 'edit', :notice =>  "Error saving note."}
        format.json { render :status => 500, :json => { action: 'create', note: @note}}
      end
    end
  end

  private

  ##
  # Private process_notes - Check to make sure that notes are presents. If so adds the patient and returns the payload.
  #
  # If the notes is empty a generic 404 is returned with an error message
  #
  # Use to share common setup or constraints between actions.
  #
  def process_notes(notes, caller, err_msg)
    if notes.blank?
      respond_to do |format|
        format.html { render action: 'show' }
        format.json { render :status => 404, :json => { action: caller, errors: err_msg}}
      end
    return
    end

    patient = Patient.find(notes[0].patient_id)

    respond_to do |format|
      format.html { render action: 'show' }
      format.json { render :status => 200, :json => { action: caller,
                    notes: notes, user: @user, profile: @therapist, patient: patient }}
    end
  end

  ##
  # Private getProfile - Creates the @user and @profile object based on the currently signed in user
  #
  # Use to share common setup or constraints between actions.
  #
  def getProfile
    @user = current_user
    @therapist = @user.getProfileable
  end

  ##
  # Private note_params - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Use to share common setup or constraints between actions.
  #
  def note_params
    params.require(:note).permit(:id, :therapist_id, :patient_id, :note_type, :note, :session_id)
  end

end
