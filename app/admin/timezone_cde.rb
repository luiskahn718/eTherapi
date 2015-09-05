ActiveAdmin.register TimezoneCde do

  permit_params :timezone_id, :name, :country_abbreviation

  menu :parent => "Code Table"

end