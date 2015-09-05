ActiveAdmin.register InsuranceCompany do
  
  permit_params :id, :insurance_id, :name, :payer_id, :state, :address, :claims, :remittance_advice, :eligibility, :electronic_cob, :web_site

  menu :parent => "Code Table"

end
