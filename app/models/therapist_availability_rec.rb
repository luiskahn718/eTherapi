class TherapistAvailabilityRec < ActiveRecord::Base
  require 'ice_cube'
  include IceCube

  belongs_to :therapist, :foreign_key => 'therapist_id'
  validates_presence_of :recurring_type

  def get_end_date
    end_time = Time.new(self.start_date.year, self.start_date.month, self.start_date.day, self.end_time.hour, self.end_time.min)

    #Lets set the end Date to 30 days in the future, unless there's a configured end date
    end_date = Time.now + 30
    if !self.end_date.blank?
      end_date = Time.new(self.end_date.year, self.end_date.month, self.end_date.day, self.end_time.hour, self.end_time.min)
    end
    end_date
  end



  #Create the availability schedule based on the configured fields
  def get_schedule
    # Set the Occurrence start date and time and duration - end_time if the end time of the configured availability
    start_time = self.start_date
    end_time = get_end_date

    #Create the inital Schedule
    schedule = Schedule.new(start_time, :end_time => end_time) do |s|

    # Add the recurence
      if self.recurring_type.downcase == 'daily'
        # Create a daily occurence if the everyweekday is selected
        s.add_recurrence_rule(Rule.daily) if self.daily_every_weekday == '1'

        # OR Create a occurence every x days if the everyweekday is NOT selected
        s.add_recurrence_rule(Rule.daily(self.daily_every_no_days)) if self.daily_every_weekday == '0'

      elsif self.recurring_type.downcase == 'weekly'
        #Create the array of weekly days
        weekdays = Array.new
        weekdays.push :sunday if self.weekly_sunday == '1'
        weekdays.push :monday if self.weekly_monday == '1'
        weekdays.push :tuesday if self.weekly_tuesday == '1'
        weekdays.push :wednesday if self.weekly_wednesday == '1'
        weekdays.push :thursday if self.weekly_thursday == '1'
        weekdays.push :friday if self.weekly_friday == '1'
        weekdays.push :saturday if self.weekly_saturday == '1'
        s.add_recurrence_rule(Rule.weekly().day(weekdays))

      elsif self.recurring_type.downcase == 'monthly'
        #create a monthly recurrence of the date
        s.add_recurrence_rule(Rule.monthly)
      end
    end
    schedule
  end

  #returns an array of occurence
  def get_occurrences
    get_schedule.occurrences(get_end_date)
  end

  def display_name
    self.start_date.to_s + ' - ' + self.end_date.to_s + ', ' + self.recurring_type.to_s
  end

  def start_clock
    self.start_time.strftime("%H:%M:%S")
  end

  def end_clock
    self.end_time.strftime("%H:%M:%S")
  end
end
