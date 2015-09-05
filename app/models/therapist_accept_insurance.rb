class TherapistAcceptInsurance < ActiveRecord::Base
 belongs_to :entity, :polymorphic => true
  
  self.primary_key = 'insurance_id'
  
  def display_name
    InsuranceCompany.where(self.insurance_payer_id).name
  end
  
end
