##
# Availability Controller.
# This controller is responsible for the managememt of all availabilities. Recurring and Single
#
# [Ability Configuration]
# * Therapist can
#   1. :index
#   2. :show
#   3. :update
#   4. :create
#
# * Patient can
#   1. NONE
#
class AvailabilityController < ApplicationController
  
  skip_before_filter  :json_verify_authenticity_token
  #Before precess filters
  
  before_filter :authenticate_user!, :except => [:index]
  skip_authorize_resource :only => :index
  authorize_resource :class => false

  ##
  # Show the detail of a specific availability. The availability type must be passed as a parameter.
  #
  # The type parameter must be passed as type=x. The valid type are s or single for a single availability and r or recurring for recurring availability 
  #
  # Example : http://localhost:3000/availability/4?type=s
  #
  # Called from the Route : +availablity+ | GET | /availablity/:id/show(.:format) | appointments#show
  #
  # Calls template : views/availabitity/index.html.haml - on error
  #
  # Error 412 will be returned if the type is empty or not valid
  #
  # [Returns]
  #   * @availability
  #   * @user
  #   * @therapist
  #   * :status
  #
  def show
    # Get the profile of the current user
    getProfile
    
    # Check if the availability type was passed
    if params[:type].blank?
      respond_to do |format|
        format.html { redirect_to availabitity_index}
        format.json { render json:  { :errors => "Type must be passed in the parameter list." }, status: 412 }
      end
      return
    end

    # We have the availability type, lets return the single record for the availability requested
    if params[:type].downcase == 'single' || params[:type].downcase == 'recurring' || params[:type].downcase == 's' || params[:type].downcase == 'r'
      if params[:type].downcase[0] == 's'
        @availability = TherapistAvailability.find(params[:id])
      else
        @availability = TherapistAvailabilityRec.find(params[:id])
      end
      
      respond_to do |format|
        format.html { redirect_to availabitity_index}
        format.json { render :status => 200, :json => { action: :show, 
          availability: @availability, user: @user, therapist: @therapist}}
      end
    else 
      respond_to do |format|
        format.html { redirect_to availabitity_index}
        format.json { render json:  { :errors => "Type must be 's' or 'r' or 'single' or 'recurring'." }, status: 412 }
      end
      return
    end
  end
  
  ##
  # Index - lists all availabilities for the current user.
  #
  # Called from the Route : +availability_index+ | GET | /availability(.:format) | availability#index
  #
  # Calls template : views/availabitity/index.html.haml - on error
  #
  # [Returns]
  #   * @Availabilities
  #   * @Rec_Availabilities
  #   * @user
  #   * @therapist
  #   * :status
  #
  def index
    getProfile
    @availabilities = @therapist.get_availabilities
    @rec_Availabilities = @therapist.get_recuring_availabilities(2000,1)
    respond_to do |format|
      format.html { redirect_to availabitity_index, notice: "Appointment declined."}
      format.json { render :status => 200, :json => { action: :index,
        availabilities: @availabilities,
        rec_availabilities: @rec_Availabilities,
        user: @user, therapist: @therapist}}
    end
  end

  ##
  # Update the list of availability passed in parameter. :id is ignored
  #
  # Called from the Route : | PATCH | /availability/:id(.:format) | availability#update
  #
  # Calls template : Dashboards
  #
  # [Returns]
  #   * Status
  #   * Errors
  #
  #
  #  [JSON parameter format]
  #   {"therapist":{"first_name":"name", 
  #       "therapist_availability_attributes":{"0":{"date":"2014-07-06", "start_time":"02:15", "end_time":"13:15", "id":"4", "_destroy":"false"}, 
  #                                            "1":{"date":"2015-05-05", "start_time":"02:10", "end_time":"10:05", "id":"6", "_destroy":"false"}}, 
  #       "therapist_availability_rec_attributes":{"0":{"start_date":"2015-02-05", "end_date":"2015-11-05", "start_time":"08:15", "end_time":"15:08", "recurring_type":"weekly", "daily_every_no_days":"2", "daily_every_weekday":"0", "weekly_sunday":"0", "weekly_monday":"0", "weekly_tuesday":"1", "weekly_wednesday":"0", "weekly_thursday":"0", "weekly_friday":"1", "weekly_saturday":"0", "id":"1", "_destroy":"false"}, 
  #                                                "1401287646304":{"start_date":"2014-06-01", "end_date":"2014-09-01", "start_time":"12:00", "end_time":"20:00", "recurring_type":"weekly", "daily_every_no_days":"1", "daily_every_weekday":"0", "weekly_sunday":"0", "weekly_monday":"0", "weekly_tuesday":"0", "weekly_wednesday":"0", "weekly_thursday":"0", "weekly_friday":"1", "weekly_saturday":"0", "id":"", "_destroy":"false"}}}}
  #
  def update
    getProfile
    if @therapist.update_attributes(white_params)
      respond_to do |format|
        format.html { redirect_to dashboards_path, notice: "Availabilities saved."}
        format.json { render :status => 200, :json => { action: :updated}}
      end
    else
      respond_to do |format|
        format.html { redirect_to dashboards_path, notice: "Availabilities not saved."}
        format.json { render :status => 400, :json => { action: :updates}}
      end
    end    
  end
  
  private
  
  ##
  # Private getProfile - Creates the @user and @profile object based on the currently signed in user
  #
  # Use to share common setup or constraints between actions.
  #
  def getProfile
    @therapist = Therapist.find(params[:therapist_id])
    @user = User.find(@therapist.user_id)
  end

  ##
  # Private white_params - Never trust parameters from the scary internet, only allow the white list through.
  #
  # Strong Parameter white list of parameters. Primarily defined in the Therapist model, for reusability.
  #
  # Use to share common setup or constraints between actions.
  #
  def white_params
    params.require(:therapist).permit(Therapist.therapist_whitelist, 
      therapist_availability_attributes:Therapist.therapist_availability_whitelist, 
      therapist_availability_rec_attributes:Therapist.therapist_recurring_whitelist)
  end

  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end
end
