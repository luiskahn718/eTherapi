ActiveAdmin.register StateLicenseCde do
  permit_params :state_id, :license_abbreviation, :name, :inactive_date, :true_state_code

  remove_filter :state_cde
  menu :parent => "Code Table"
end
