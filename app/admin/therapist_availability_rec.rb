ActiveAdmin.register TherapistAvailabilityRec do

  permit_params Therapist.therapist_recurring_whitelist

  navigation_menu :therapist

end