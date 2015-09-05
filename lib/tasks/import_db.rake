require 'rake'
require 'date'
# namespace :dj do
# 	task :import_db => :environment do
# 	 puts User.all
# 	end
# end

# task :import_db, [:abc] => :environment do |t, args|

# 	puts " #{args[:abc]}"
# 	puts User.all
# end

task :import_db, [:date] => :environment do |t, args|
		# puts date
		### CREATE USERs #####
		# create admin user.
	user = User.find_by_email('thien.lequang@asnet.com.vn')
	if !user.present?
		user = User.create! :first_name => 'Thien', :last_name => 'Lequang', :email => 'thien.lequang@asnet.com.vn', :password => 'admin@123', :password_confirmation => 'admin@123', :account_type => 'admin'
		puts 'User Admin created: ' << user.email
	end
	# create patient and the therapist
	user1 = User.find_by_email('asnet.test001@gmail.com')
	if !user1.present?
		user1 = User.create! :first_name => 'therapist', :last_name => '1', :email => 'asnet.test001@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
		puts 'therapist 1 created: ' << user1.email
	end

	user2 = User.find_by_email('asnet.test002@gmail.com')
	if !user2.present?
		user2 = User.create! :first_name => 'therapist', :last_name => '2', :email => 'asnet.test002@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'therapist'
		puts 'therapist 2 created: ' << user2.email
	end

	user3 = User.find_by_email('asnet.test003@gmail.com')
	if !user3.present?
		user3 = User.create! :first_name => 'patient', :last_name => '1', :email => 'asnet.test003@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
		puts 'patient 1 created: ' << user3.email
	end

	user4 = User.find_by_email('asnet.test004@gmail.com')
	if !user4.present?
		user4 = User.create! :first_name => 'patient', :last_name => '1', :email => 'asnet.test004@gmail.com', :password => 'abc@12345', :password_confirmation => 'abc@12345', :account_type => 'patient'
		puts 'patient 2 created: ' << user4.email
	end

	puts 'SETTING UP Therapist and patient'
	therapist1 = Therapist.find_by_user_id(user1.id)
	if !therapist1.present?
		therapist1 = Therapist.create! :user_id => user1.id, :last_name => user1.last_name, :first_name => user1.first_name, :gender => "M", :timezone => "VN", :npi_no => 60
		puts "created therapist 1"
	end

	therapist2 = Therapist.find_by_user_id(user2.id)
	if !therapist2.present?
		therapist2 = Therapist.create! :user_id => user2.id, :last_name => user2.last_name, :first_name => user2.first_name, :gender => "M", :timezone => "VN", :npi_no => 60
		puts "created therapist 2"
	end

	patient1 = Patient.find_by_user_id(user3.id)
	if !patient1.present?
		birth1 = Time.now - SecureRandom.random_number(50).year
		patient1 = Patient.create! :user_id => user3.id, :last_name => user3.last_name, :first_name => user3.first_name, :gender => "F", :date_of_birth => birth1, :language => "EN", :timezone => "VN"
		puts "created patient 1"
	end
	patient2 = Patient.find_by_user_id(user4.id)
	if !patient2.present?
		birth2 = Time.now - SecureRandom.random_number(50).year
		patient2 = Patient.create! :user_id => user4.id, :last_name => user4.last_name, :first_name => user4.first_name, :gender => "M", :date_of_birth => birth2, :language => "EN", :timezone => "VN"
		puts "created patient 2"
	end

	#######APPOINTMENT#############
	date = DateTime.parse(args[:date])
	# date = Date.today
	# create 5 appointment in past
	patient_ids = Patient.all.map{ |p| p.id }
	therapist_ids = Therapist.all.map { |t| t.id }
	i = 1
	while i < 6 do
		past = date.advance(days: -i)
		feature = date.advance(days: i)
		therapist_id = therapist_ids.sample
		patient_id = patient_ids.sample
		past_apoitment = Appointment.create! :owner_id => therapist_id, :therapist_id => therapist_id, :patient_id => patient_id, :date => past, :start_time => "08:00:00", :end_time => "09:00:00", :status => "c"
		feature_apoitment = Appointment.create! :owner_id => therapist_id, :therapist_id => therapist_id, :patient_id => patient_id, :date => feature, :start_time => "08:00:00", :end_time => "09:00:00", :status => "c"
		i += 1
	end
end