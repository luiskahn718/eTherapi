ActiveAdmin.register PatientInsurance do
  
  permit_params Patient.patient_insurance_whitelist
  navigation_menu :patient

end
