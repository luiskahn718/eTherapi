ActiveAdmin.register Appointment do

  permit_params [:start_time, :end_time, :date, :session_type, :therapist_id, :patient_id, :status, :owner_id]

  navigation_menu :therapist

  index do
    selectable_column
    column :start_time
    column :end_time
    column :date
    column :session_type
    column :therapist_id
    column :patient_id
    column :status
    column :owner_id
    actions
  end

  form do |f|
    f.inputs "Details" do
      f.input :start_time
      f.input :end_time
      f.input :date
      f.input :session_type
      f.input :therapist_id
      f.input :patient_id
      f.input :status
      f.input :owner_id
    end
    f.actions
  end
end
