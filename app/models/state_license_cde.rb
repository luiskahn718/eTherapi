#### Add StateLicenseCde model for use in getcode api

class StateLicenseCde < ActiveRecord::Base
  belongs_to :state_cde, foreign_key: "state_id"
end
