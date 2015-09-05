require 'spec_helper'

describe User do
  
  before(:each) do
    @userData = {
      :first_name => "First Test",
      :last_name => "Last Test",
      :email => "user@test.com",
      :password => "usertest",
      :password_confirmation => "usertest",
      }
  end
  
  it "should create a new test user" do
    User.create!(@userData)
  end
  
  it "should fail since the email is missing" do
    missingemail = User.new(@userData.merge(:email => ""))
    missingemail.should_not_be_valid
  end 

  it "should fail since the password are not matching" do
    passwordmismatch = User.new(@userData.merge(:password_confirmation => ""))
    passwordmismatch.should_not_be_valid
  end 

  it "should update the user" do
    user = User.new(@userData)
    #Missing update data
  end 

  
end
