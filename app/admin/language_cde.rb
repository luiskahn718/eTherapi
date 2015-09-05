ActiveAdmin.register LanguageCde do
  remove_filter :therapist_sec_language
  
  permit_params :language

  menu :parent => "Code Table"

end
