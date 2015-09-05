ActiveAdmin.register TherapistLicense do
  
  permit_params Therapist.therapist_license_whitelist
  navigation_menu :therapist
end
