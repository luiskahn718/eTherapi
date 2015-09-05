class TherapistAvailability < ActiveRecord::Base
  require 'ice_cube'
  include IceCube

  belongs_to :therapist

  def get_schedule
    Schedule.new(parsed_start_time, :end_time => parsed_end_time){ |s| s.add_recurrence_rule(Rule.daily.count(1)) }
  end

  def get_occurrences
    get_schedule.occurrences(parsed_start_time)
  end

  def display_name
    self.date.to_s + ' : ' + self.start_time.to_s + ' - ' + self.end_time.to_s
  end

  def parsed_start_time
    Time.parse(self.date.to_s + " " + self.start_time.strftime("%H:%M:%S"))
  end

  def parsed_end_time
    Time.parse(self.date.to_s + " " + self.end_time.strftime("%H:%M:%S"))
  end

  def start_clock
    self.start_time.strftime("%H:%M:%S")
  end

  def end_clock
    self.end_time.strftime("%H:%M:%S")
  end
end
