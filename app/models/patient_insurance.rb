class PatientInsurance < ActiveRecord::Base
  self.primary_key = 'patient_insurance_id'
  
  belongs_to :patient, :foreign_key => 'patient_id'
end
