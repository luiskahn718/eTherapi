ActiveAdmin.register CountryCde do
  
  permit_params :abbreviation, :name

  menu :parent => "Code Table"

end
