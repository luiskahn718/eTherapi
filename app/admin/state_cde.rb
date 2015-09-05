ActiveAdmin.register StateCde do
  permit_params :state_id, :abbreviation, :country_cde, :name, :state_type
 
  menu :parent => "Code Table"

end