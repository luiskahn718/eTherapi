## THis controller will be removed soon. move it in to therepist profile.

class ProfilesController < ApplicationController

	skip_before_filter  :json_verify_authenticity_token

  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end
	# Before precess filters
  before_filter :authenticate_user!

  def show
  	@user = User.find(params[:id])
    @profile = @user.getProfileable
    # get patientlist in here for search patient
    @patientlist = TherapistPatient.get_my_patients @profile.user_id
  	gon.push({:user => @user,
              :profile => @profile,
              :therapist_consent => @profile.therapist_consent,
              :therapist_profile => @profile.therapist_profile,
              :state_cdes => StateCde.all.order(:name),
              :patientlist => @patientlist,
              :country_cdes => CountryCde.all.select{|c| c.name == 'United States'} + CountryCde.all.select{ |c| c.name != 'United States'} # Little trick, get United States first
      })
  	render :layout => 'main'

  end
end