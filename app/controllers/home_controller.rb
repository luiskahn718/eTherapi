##
# Home Controller.
#
# Default RUBY Home controller - Nothing happening here
#
class HomeController < ApplicationController
  def index
  	gon.push({
      :speciality_cdes => SpecialityCde.all,
      :state_cdes => StateCde.all.order(:name),
      :license_type_cdes => LicenseTypeCde.all,
      :insurance_payers_names => InsurancePayersName.all,
      :user => current_user || []
      })
    respond_to do |format|
      # format.html { redirect_to :dashboards}
      # format.html { render :index }
      format.html { render :index, :layout => 'main_home'}
      format.json { render :status => 200, :json => { :success => true, :info => "Home", :user => current_user } }
    end
  end
  #
  # This function use for home page, and will be remove after finish.
  def custom_index
  	gon.push({})
    respond_to do |format|


      format.html { render :index, :layout => 'main_home'}
      format.json { render :status => 200, :json => { :success => true, :info => "Home", :user => current_user } }
	end

  end
end
