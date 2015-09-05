ActiveAdmin.register Therapist, :namespace => :admin do
  remove_filter :therapist_profile
  remove_filter :patient
  remove_filter :therapist_patient
  remove_filter :therapist_accept_insurance
  permit_params Therapist.therapist_whitelist

  menu :parent => "Therapist"

  index do
    selectable_column
    column :therapist_id
    column :user_id
    column :last_name
    column :first_name
    actions
  end

  sidebar "Details", only: [:show, :edit] do
    ul do
      li link_to("Profile", admin_therapist_profile_path(params[:id]))
      li link_to("Languages", admin_therapist_languages_path)
      li link_to("Specialities", admin_therapist_specialities_path)
      li link_to("Licenses", admin_therapist_licenses_path)
      li link_to("Availability", admin_therapist_availabilities_path)
      li link_to("Recurring Availability", admin_therapist_availability_recs_path)
      li link_to("Appointments", admin_appointments_path)
    end
  end

end
