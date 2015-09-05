ActiveAdmin.register TherapistProfile do
  
  permit_params Therapist.therapist_profile_whitelist
   navigation_menu :therapist

end
