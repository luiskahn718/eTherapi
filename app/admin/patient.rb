ActiveAdmin.register Patient do
  remove_filter :patient_insurance
  remove_filter :therapist_patient
  permit_params Patient.patient_whitelist

  menu :parent => "Patient"

  sidebar "Details", only: [:show, :edit] do
    ul do
      li link_to("Insurance", admin_patient_insurance_path(params[:id]))
    end
  end

end
