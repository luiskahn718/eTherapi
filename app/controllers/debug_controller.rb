class DebugController < ApplicationController

	def index
		# user = User.find_by_email('asnet.test002@gmail.com')
		# sign_in(user)
		# profileable = user.getProfileable
		# if user.is_therapist?
  #     if profileable.therapist_id.blank?
  #       redirect_to retherapist_profile_steps_path(user)
  #     else
  #       redirect_to dashboards_path(user)
  #     end

  #   elsif user.is_patient?
  #     if profileable.patient_id.blank?
  #       redirect_to patient_profile_steps_path(user)
  #     else
  #       redirect_to dashboards_path(user)
  #     end
  #   elsif user.is_admin?
  #     redirect_to dashboards_path(user)
  #   end



	end

  def therapist_without_any_appointment
    # create a user
    user = User.find_by_email('no_appoitment_therapist@asnet.test')
    unless user.present?
      user = User.create :first_name => 'no_appoitment', :last_name => 'therapist', :email => 'no_appoitment_therapist@asnet.test', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim user
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})

      # create therapists
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60
    end
    sign_in(user)
    redirect_to dashboards_path(user)
  end

  def login_with_therapist_without_any_appointment
    user = User.find_by_email('no_appoitment_therapist@asnet.test')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end

	def therapist_with_confirm_and_pending_appointment

    user = User.find_by_email('new_therapist@gmail.com')
    unless user.present?
      # create a user
      user = User.create :first_name => 'normal', :last_name => "therapist", :email => 'new_therapist@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60

    else
      therapist = Therapist.find_by_user_id(user.id)
    end

    # create random 5 user for patien
    i = 1
    date = Date.today

    while i < 5 do
      past = date.advance(days: -i)
      feature = date.advance(days: i)
      patient_user = User.create :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      patient_user.save(validate: false)
      #confirm it too
      patient_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})

      # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      patient = Patient.create :user_id => patient_user.id, :last_name => patient_user.last_name, :first_name => patient_user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "VN", :medical_history => Faker::Lorem.paragraph(2)
      patient.save(validate: false)
      # create patient_isurance
      # patient_insurance = PatientInsurance.create! :patient_id => patient.id, :seq => 1, :subscriber_relationship => ["P", "D"].sample, :policy_number => "policy_number", :group_number => "group_number", :group_name => "group_name", :subscriber_last_name => Faker::Name.last_name, :subscriber_first_name => Faker::Name.first_name, :subscriber_dob => birth, :subscriber_address1 => Faker::Address.street_address, :subscriber_address2 => Faker::Address.secondary_address , :subscriber_city => Faker::Address.city
      # create 5 cancel appointments
      cancel_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => [past, feature].sample, :start_time => "08:00:00", :end_time => "09:00:00", :status => "x", :delete_date => Time.now
      # create 5 past appointments
      past_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => past, :start_time => "08:00:00", :end_time => "09:00:00", :status => ["c", "x"].sample
      # create 5 request/pending appointments
      pending_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "p"
      # create 5 upcomming appointments
      upcomming_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "c"

      #Create a relationship if it doesn't exist and there's a patient
      if !upcomming_appointment.patient_id.blank?
        therapist_user_id = Therapist.find(upcomming_appointment.therapist_id)
        patient_user_id = Patient.find(upcomming_appointment.patient_id)
        if !TherapistPatient.has_relation?(therapist_user_id.user_id, patient_user_id.user_id)
          relation = TherapistPatient.new
          relation.therapist_user_id = therapist_user_id.user_id
          relation.patient_user_id = patient_user_id.user_id
          relation.start_date = Time.now
          relation.accepted_on = Time.now
          relation.save
        end
        ##### STORE the consent information and create the session
        PatientConsent.acknownledge(upcomming_appointment.therapist_id, upcomming_appointment.patient_id, nil)
        session_log = SessionLog.new
        session_log.appointment_id = upcomming_appointment.id
        session_log.therapist_id = upcomming_appointment.therapist_id
        session_log.patient_id = upcomming_appointment.patient_id
        session_log.save
      end

      i += 1
    end
    sign_in(user)
    redirect_to dashboards_path(user)

	end

  def login_with_therapist_with_confirm_and_pending_appointment
    user = User.find_by_email('new_therapist@gmail.com')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end

  def therapist_with_patient_has_medical_histories
    user = User.find_by_email('therapist_medical@gmail.com')
    unless user.present?
      # create a user
      user = User.create :first_name => 'normal', :last_name => "therapist", :email => 'therapist_medical@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60

    else
      therapist = Therapist.find_by_user_id(user.id)
    end

    # create random 5 user for patien
    i = 1
    date = Date.today

    while i < 5 do
      past = date.advance(days: -i)
      feature = date.advance(days: i)
      patient_user = User.create :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      patient_user.save(validate: false)
      #confirm it too
      patient_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})

      # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      patient = Patient.create :user_id => patient_user.id, :last_name => patient_user.last_name, :first_name => patient_user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "VN", :medical_history => Faker::Lorem.paragraph(2)
      patient.save(validate: false)
      # create patient_isurance
      # create 5 cancel appointments
      cancel_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => [past, feature].sample, :start_time => "08:00:00", :end_time => "09:00:00", :status => "x", :delete_date => Time.now
      # create 5 past appointments
      past_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => past, :start_time => "08:00:00", :end_time => "09:00:00", :status => ["c", "x"].sample
      # create 5 request/pending appointments
      pending_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "p"
      # create 5 upcomming appointments
      upcomming_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "c"

      #Create a relationship if it doesn't exist and there's a patient
      if !upcomming_appointment.patient_id.blank?
        therapist_user_id = Therapist.find(upcomming_appointment.therapist_id)
        patient_user_id = Patient.find(upcomming_appointment.patient_id)
        if !TherapistPatient.has_relation?(therapist_user_id.user_id, patient_user_id.user_id)
          relation = TherapistPatient.new
          relation.therapist_user_id = therapist_user_id.user_id
          relation.patient_user_id = patient_user_id.user_id
          relation.start_date = Time.now
          relation.accepted_on = Time.now
        relation.save
        end
      end
      i += 1
    end
    sign_in(user)
    redirect_to dashboards_path(user)
  end


  def login_with_therapist_with_patient_has_medical_histories
    user = User.find_by_email('therapist_medical@gmail.com')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end


  def therapist_with_all_pending_appointment

    user = User.find_by_email('all_pending@gmail.com')
    unless user.present?
      # create a user
      user = User.create :first_name => 'normal', :last_name => "therapist", :email => 'all_pending@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60
    else
      therapist = Therapist.find_by_user_id(user.id)
    end
    # create random 5 user for patien
    i = 1
    date = Date.today

    while i < 10 do
      past = date.advance(days: -i)
      feature = date.advance(days: i)
      patient_user = User.create :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      patient_user.save(validate: false)
      #confirm it too
      patient_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})

      # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      patient = Patient.create :user_id => patient_user.id, :last_name => patient_user.last_name, :first_name => patient_user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "VN", :medical_history => Faker::Lorem.paragraph(2)
      patient.save(validate: false)

      pending_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "p"

      i += 1
    end
    sign_in(user)
    redirect_to dashboards_path(user)

  end

  def login_with_therapist_with_all_pending_appointment
    user = User.find_by_email('all_pending@gmail.com')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end


  def therapist_with_all_cancel_appointment

    user = User.find_by_email('all_cancel@gmail.com')
    unless user.present?
      # create a user
      user = User.create :first_name => 'normal', :last_name => "therapist", :email => 'all_cancel@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60
    else
      therapist = Therapist.find_by_user_id(user.id)
    end
    # create random 10 user for patien
    i = 1
    date = Date.today

    while i < 10 do
      past = date.advance(days: -i)
      feature = date.advance(days: i)
      patient_user = User.create :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      patient_user.save(validate: false)
      #confirm it too
      patient_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})

      # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      patient = Patient.create :user_id => patient_user.id, :last_name => patient_user.last_name, :first_name => patient_user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "VN", :medical_history => Faker::Lorem.paragraph(2)
      patient.save(validate: false)
      # create patient_isurance
      # patient_insurance = PatientInsurance.create! :patient_id => patient.id, :seq => 1, :subscriber_relationship => ["P", "D"].sample, :policy_number => "policy_number", :group_number => "group_number", :group_name => "group_name", :subscriber_last_name => Faker::Name.last_name, :subscriber_first_name => Faker::Name.first_name, :subscriber_dob => birth, :subscriber_address1 => Faker::Address.street_address, :subscriber_address2 => Faker::Address.secondary_address , :subscriber_city => Faker::Address.city
      # create 5 cancel appointments
      cancel_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => [past, feature].sample, :start_time => "08:00:00", :end_time => "09:00:00", :status => "x", :delete_date => Time.now
      # create 5 past appointments
      past_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => past, :start_time => "08:00:00", :end_time => "09:00:00", :status => ["c", "x"].sample
      i += 1
    end

    sign_in(user)
    redirect_to dashboards_path(user)

  end

  def therapist_with_all_cancel_request_upcomming_appointment

    user = User.find_by_email('new_normal@gmail.com')
    unless user.present?
      # create a user
      user = User.create :first_name => 'normal', :last_name => "therapist", :email => 'new_normal@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60
    else
      therapist = Therapist.find_by_user_id(user.id)

    end
    # create random 10 user for patient
    i = 1
    date = Date.today

    while i < 10 do
      past = date.advance(days: -i)
      feature = date.advance(days: i)
      patient_user = User.create :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      patient_user.save(validate: false)
      #confirm it too
      patient_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})

      # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      patient = Patient.create :user_id => patient_user.id, :last_name => patient_user.last_name, :first_name => patient_user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "VN", :medical_history => Faker::Lorem.paragraph(2)
      patient.save(validate: false)
      # create patient_isurance
      # patient_insurance = PatientInsurance.create! :patient_id => patient.id, :seq => 1, :subscriber_relationship => ["P", "D"].sample, :policy_number => "policy_number", :group_number => "group_number", :group_name => "group_name", :subscriber_last_name => Faker::Name.last_name, :subscriber_first_name => Faker::Name.first_name, :subscriber_dob => birth, :subscriber_address1 => Faker::Address.street_address, :subscriber_address2 => Faker::Address.secondary_address , :subscriber_city => Faker::Address.city
      # create 5 cancel appointments
      cancel_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => [past, feature].sample, :start_time => "08:00:00", :end_time => "09:00:00", :status => "x", :delete_date => Time.now
      # create 5 past appointments
      past_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => past, :start_time => "08:00:00", :end_time => "09:00:00", :status => ["c", "x"].sample
      # create 5 request/pending appointments
      pending_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "p"
      # create 5 upcomming appointments
      upcomming_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "c"

      #Create a relationship if it doesn't exist and there's a patient
      if !upcomming_appointment.patient_id.blank?
        therapist_user_id = Therapist.find(upcomming_appointment.therapist_id)
        patient_user_id = Patient.find(upcomming_appointment.patient_id)
        if !TherapistPatient.has_relation?(therapist_user_id.user_id, patient_user_id.user_id)
          relation = TherapistPatient.new
          relation.therapist_user_id = therapist_user_id.user_id
          relation.patient_user_id = patient_user_id.user_id
          relation.start_date = Time.now
          relation.accepted_on = Time.now
        relation.save
        end
        PatientConsent.acknownledge(upcomming_appointment.therapist_id, upcomming_appointment.patient_id, nil)
        session_log = SessionLog.new
        session_log.appointment_id = upcomming_appointment.id
        session_log.therapist_id = upcomming_appointment.therapist_id
        session_log.patient_id = upcomming_appointment.patient_id
        session_log.save
      end
      i += 1
    end

    sign_in(user)
    redirect_to appointments_path()

  end

  def login_with_therapist_with_all_cancel_request_upcomming_appointment
    user = User.find_by_email('new_normal@gmail.com')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end

  def therapist_with_canceled_appoitment_in_24h
    user = User.find_by_email('in24_cancel@gmail.com')

    unless user.present?
      # create a user
      user = User.create :first_name => 'in24_cancel', :last_name => "therapist", :email => 'in24_cancel@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60
    else
      therapist = Therapist.find_by_user_id(user.id)
    end
    # create random 10 user for patient
    i = 1
    date = Date.today
    appointment_date = date.advance(days: 2)
    while i < 10 do
      patient_user = User.create :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      patient_user.save(validate: false)
      #confirm it too
      patient_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
       # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      cancel_date = date.advance(days: 1)
      patient = Patient.create :user_id => patient_user.id, :last_name => patient_user.last_name, :first_name => patient_user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "VN", :medical_history => Faker::Lorem.paragraph(2)
      cancel_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => appointment_date, :start_time => "07:30:00", :end_time => "09:00:00", :status => "x", :delete_date => Time.new(cancel_date.year, cancel_date.month, cancel_date.day, 9, 0, 0)
      i += 1
    end



    sign_in(user)
    redirect_to appointments_path()
  end

  def login_with_therapist_with_canceled_appoitment_in_24h
    user = User.find_by_email('in24_cancel@gmail.com')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end

  def therapist_with_canceled_appoitment_over_24h
    user = User.find_by_email('over24_cancel@gmail.com')

    unless user.present?
      # create a user
      user = User.create :first_name => 'over24_cancel', :last_name => "therapist", :email => 'over24_cancel@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :timezone => "VN", :npi_no => 60

    else
      therapist = Therapist.find_by_user_id(user.id)
    end
    # create patient and add new cancel appointment
    i = 1
    date = Date.today
    appointment_date = date.advance(days: 3)
    while i < 10 do
      patient_user = User.create :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      patient_user.save(validate: false)
      #confirm it too
      patient_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
       # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      cancel_date = date.advance(days: 1)
      patient = Patient.create :user_id => patient_user.id, :last_name => patient_user.last_name, :first_name => patient_user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "VN", :medical_history => Faker::Lorem.paragraph(2)
      cancel_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => appointment_date, :start_time => "07:30:00", :end_time => "09:00:00", :status => "x", :delete_date => Time.new(cancel_date.year, cancel_date.month, cancel_date.day, 9, 0, 0)
      i += 1
    end

    sign_in(user)
    redirect_to appointments_path()
  end

  def login_with_therapist_with_canceled_appoitment_over_24h
    user = User.find_by_email('over24_cancel@gmail.com')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end


  #########User for patient appointment###########################

  def normal_patient_with_request_upcomming_cancle_appointment

    user = User.find_by_email('new_patient@gmail.com')
    unless  user.present?
      # create a user
      user = User.create :first_name => "patient", :last_name => "normal", :email => 'new_patient@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
      user.save(validate: false)
      # confim it too
      user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the patient with this user
      birth = Time.now - SecureRandom.random_number(50).year
      patient = Patient.create :user_id => user.id, :last_name => user.last_name, :first_name => user.first_name, :gender => "M", :date_of_birth => birth, :language => "EN", :timezone => "Pacific/Honolulu", :medical_history => Faker::Lorem.paragraph(2)
      # create patient_isurance
      # patient_insurance = PatientInsurance.create! :patient_id => patient.id, :seq => 1, :subscriber_relationship => ["P", "D"].sample, :policy_number => "policy_number", :group_number => "group_number", :group_name => "group_name", :subscriber_last_name => Faker::Name.last_name, :subscriber_first_name => Faker::Name.first_name, :subscriber_dob => birth, :subscriber_address1 => Faker::Address.street_address, :subscriber_address2 => Faker::Address.secondary_address , :subscriber_city => Faker::Address.city
    else
      patient = Patient.find_by_user_id(user.id)
    end
    # create 2 therapist for this
    for i in 1..3
      therapist_user = User.create  :first_name => Faker::Name.first_name, :last_name => Faker::Name.last_name, :email => Faker::Internet.email, :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
      therapist_user.save(validate: false)
      therapist_user.update_attributes({confirmation_token: nil, confirmed_at: Time.now})
      # create the therapist with this user
      therapist = Therapist.create! :user_id => therapist_user.id, :last_name => therapist_user.last_name, :first_name => therapist_user.first_name, :gender => "M", :timezone => "VN", :npi_no => [55, 65, 78].sample
      # create 7 appointments with random
      i = 0
      date = Date.today
      while i < 5 do
      past = date.advance(days: -i)
      feature = date.advance(days: i)
        # create 5 cancel appointments
      cancel_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => [past, feature].sample, :start_time => "08:00:00", :end_time => "09:00:00", :status => "x", :delete_date => Time.now
      # create 5 past appointments
      past_apoitment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => past, :start_time => "08:00:00", :end_time => "09:00:00", :status => ["c", "x"].sample
      # create 5 request/pending appointments
      pending_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "p"
      # create 5 upcomming appointments
      upcomming_appointment = Appointment.create! :owner_id => user.id, :therapist_id => therapist.id, :patient_id => patient.id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "c"
      #Create a relationship if it doesn't exist and there's a patient
      if !upcomming_appointment.patient_id.blank?
        therapist_user_id = Therapist.find(upcomming_appointment.therapist_id)
        patient_user_id = Patient.find(upcomming_appointment.patient_id)
        if !TherapistPatient.has_relation?(therapist_user_id.user_id, patient_user_id.user_id)
          relation = TherapistPatient.new
          relation.therapist_user_id = therapist_user_id.user_id
          relation.patient_user_id = patient_user_id.user_id
          relation.start_date = Time.now
          relation.accepted_on = Time.now
        relation.save
        end
      end
      i += 1
      end
    end

    sign_in(user)
    redirect_to appointments_path()
  end

  def login_with_normal_patient_with_request_upcomming_cancle_appointment
    user = User.find_by_email('new_patient@gmail.com')
    unless user.present?
      flash[:notice] = "This account is not created. Please use link in the right."
      render :index
    else
      sign_in(user)
      redirect_to dashboards_path(user)
    end
  end
end