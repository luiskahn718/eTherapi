class InsuranceCompany < ActiveRecord::Base
    def display_name
    self.name
  end

end
