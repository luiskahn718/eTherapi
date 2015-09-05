##
# Therapist Consents Controller.
# This controller is responsible for the managememt of the Therapist profile.
#
# Created the first time a user of type patient signs in.
#
# [Ability Configuration]
# * Therapist can
#   *. :index
#   *. :show
#   *. :update
#   *. :create
#   *. :edit
#
# * Patient can
#  *. NONE
#
class TherapistConsentsController < ApplicationController
  before_filter :authenticate_user!
  authorize_resource :class => false
  ##
  # Index returns a list of all consents for the currently singend in therapist
  #
  # Called from the Route : +therapist_consents+ | GET | /therapist_consents(.:format) | therapist_consents#index
  #
  # Calls template : index
  #
  # [Returns]
  #   * @consents
  #
  def index
    getProfile
    @consents = TherapistConsent.where('therapist_id = ? ', @therapist.id)
    respond_to do |format|
      format.html { render action: 'index' }
      format.json { render :status => 200, :json => { action: 'index', consents: @consents }}
    end
  end

  ##
  # Edit the passed consent
  #
  # Called from the Route : +edit_therapist_consent+ | GET | /therapist_consents/:id/edit(.:format) | therapist_consents#edit
  #
  # Calls template : edit
  #
  # [Returns]
  #   * @therapist_consent
  #
  def edit
    @therapist_consent = TherapistConsent.find(params[:id])
    respond_to do |format|
      format.html { render action: 'edit' }
      format.json { render :status => 200, :json => { action: 'edit', therapist_consent: @therapist_consent}}
    end
  end

  ##
  # Update the passed consent
  #
  # Called from the Route : PATCH | /therapist_consents/:id(.:format) | therapist_consents#update
  #
  # Calls template : update
  #
  # [Returns]
  #   * @therapist_consent
  #
  #  [JSON parameter format]
  #     {"therapist_consent":{"id":"1", "therapist_id":"3", "version":"1", "consent_text":"The full text of the consent", "_destroy":"false"}}
  #
  def update
    getProfile
    @therapist_consent = TherapistConsent.find(params[:id])
    if @therapist_consent.update_attributes!(consent_params)
      respond_to do |format|
        format.html { render action: 'update', :notice =>  "Consent saved." }
        format.json { render :status => 200, :json => { action: 'update', therapist_consent: @therapist_consent }}
      end
    else
      respond_to do |format|
        format.html { render action: 'update', :notice =>  "Unable to save consent." }
        format.json { render :status => 417, :json => { action: 'update', therapist_consent: @therapist_consent }}
      end
    end
  end

  ##
  # Create a new consent
  #
  # Called from the Route : POST | /therapist_consents(.:format) | therapist_consents#create
  #
  # Calls template : show
  #
  # [Returns]
  #   * @therapist_consent
  #
  #  [JSON parameter format]
  #     {"therapist_consent":{"id":"", "therapist_id":"3", "version":"1", "consent_text":"The full text of the consent", "_destroy":"false"}}
  #
  def create
    getProfile
    @therapist_consent = TherapistConsent.new(consent_params)
    if @therapist_consent.save
      respond_to do |format|
        format.html { render action: 'show', :notice =>  "Consent saved." }
        format.json { render :status => 200, :json => { action: 'create', therapist_consent: @therapist_consent }}
      end

    else
      respond_to do |format|
        format.html { render action: 'edit', :danger =>  "unable to save consent." }
        format.json { render :status => 417, :json => { action: 'create', therapist_consent: @therapist_consent }}
      end
    end
  end

  ##
  # Acknowledge a consent
  #
  # [Required parameters - passed in URL]
  #   *. :id - therapist consent ID
  #   *. :patient_id - patient ID
  #
  # Called from the Route : GET | /therapist_consents/:id/acknowledge/:patient_id(.:format) | therapist_consents#acknowledge
  #
  # Calls template : None
  #
  # [Returns]
  #   * Nothing
  #
  def acknowledge
    getProfile
    consent = TherapistConsent.find(params[:id])
    if PatientConsent.acknownledge(@therapist.therapist_id, params[:patient_id], consent.version)
      respond_to do |format|
        format.html { render action: 'acknowledge', :notice =>  "Consent acknowledged." }
        format.json { render :status => 200, :json => { action: 'acknowledge' }}
      end
    else
      respond_to do |format|
        format.html { render action: 'acknowledge', :danger =>  "unable to acknowledge consent." }
        format.json { render :status => 417, :json => { action: 'acknowledge' }}
      end
    end
  end

  ##
  # New consent with default values
  #
  # *. therapist_id = current therapist id
  # *. active = true
  # *. version = 1
  #
  # Called from the Route : +new_therapist_consent+ | GET | /therapist_consents/new(.:format) | therapist_consents#new
  #
  # Calls template : edit
  #
  # [Returns]
  #   * @therapist_consent
  #
  def new
    getProfile
    @therapist_consent = TherapistConsent.new
    @therapist_consent.therapist_id = @therapist.id
    @therapist_consent.active = true
    @therapist_consent.version = 1
    respond_to do |format|
      format.html { render action: 'edit' }
      format.json { render :status => 200, :json => { action: 'new', therapist_consent: @therapist_consent}}
    end
  end

  private

  ##
  # Private getProfile - Creates the @user and @therapist object based on the currently signed in user
  #
  # Use to share common setup or constraints between actions.
  #
  def getProfile
    @user = current_user
    @therapist = @user.getProfileable
  end

  ##
  # Private consent_params - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Use to share common setup or constraints between actions.
  #
  # Strong Parameter white list of parameters.
  def consent_params
    params.require(:therapist_consent).permit(:id, :therapist_id, :version, :consent_text, :_destroy)
  end

end
