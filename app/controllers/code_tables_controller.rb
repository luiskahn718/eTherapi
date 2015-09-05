##
# CodeTable Controller.
# This controller is responsible for sending bacl the list of code requested
#
# [Ability Configuration]
# * All can
#   1. :get_code_table
#
class CodeTablesController < ApplicationController

  respond_to :json

  skip_before_filter  :json_verify_authenticity_token
  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end

  before_filter :authenticate_user!
  authorize_resource :class => false

  ##
  # Returns the full code table requested
  #
  # [Required fields :]
  #   * :code_table_name
  #
  # Example : http://localhost:3000/code_tables/get_code_table/state_cde
  #
  # Called from the Route : get_code_table | GET | /code_tables/get_code_table/:code_table_name(.:format) | code_tables#get_code_table
  #
  # [Returns]
  #   * codetable_name
  #   * codetable
  #   * status - the status of the action
  #
  def get_code_table
    if ['state_cde', 'language_cde', 'country_cde', 'hear_bout_us_cde', 'speciality_cde', 'timezone_cde', 'state_license_cde', 'demographics_served_cde', 'treatment_approach_cde', 'insurance_payers_name', 'license_type_cde'].include? params[:code_table_name]
      render :status => 200, :json => { action: 'get_code_table', codetable_name: params[:code_table_name], codetable: params[:code_table_name].singularize.classify.constantize.all }
    else
      render :status => 404, :json => { action: 'get_code_table', codetable_name: params[:code_table_name] }
    end
  end
end