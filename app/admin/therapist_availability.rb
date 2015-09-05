ActiveAdmin.register TherapistAvailability do

  permit_params Therapist.therapist_availability_whitelist

  navigation_menu :therapist

end