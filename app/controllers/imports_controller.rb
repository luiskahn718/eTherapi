class ImportsController < ApplicationController

  ### Pulse 360 Review

  # Import company

	def language
		begin
	    ActiveRecord::Base.transaction do

	      CSV.foreach(params[:file].path,:headers => true) do |row|
	      	# Create company
	      	language = LanguageCde.find_or_create_by(language_code: row[0], language: row[1])
	      	language.save!
	      end
	    end
	    redirect_to imports_path, :notice => "Import LanguageCde success!"
	  rescue ActiveRecord::RecordInvalid => e
      render :status=> 401, :json => {:message=> e.record.errors.full_messages.join("\n ") + " at row " + i.to_s}
    end
	end

  # Import static org chart
  def state
  	begin
	    ActiveRecord::Base.transaction do

	      CSV.foreach(params[:file].path,:headers => true) do |row|
	      	puts row
	      	puts row[1]
	      	# Create company
	      	language = StateCde.find_or_create_by(abbreviation: row[1], country_cde: row[2], name: row[3], state_type: row[4])
	      	language.save!
	      end
	    end
	    redirect_to imports_path, :notice => "Import StateCde success!"
	  rescue ActiveRecord::RecordInvalid => e
      render :status=> 401, :json => {:message=> e.record.errors.full_messages.join("\n ") + " at row " + i.to_s}
    end
  end

  def country
  	begin
	    ActiveRecord::Base.transaction do

	      CSV.foreach(params[:file].path,:headers => true) do |row|
	      	# Create company
	      	language = CountryCde.find_or_create_by(abbreviation: row[1], name: row[2])
	      	language.save!
	      end
	    end
	    redirect_to imports_path, :notice => "Import CountryCde success!"
	  rescue ActiveRecord::RecordInvalid => e
      render :status=> 401, :json => {:message=> e.record.errors.full_messages.join("\n ") + " at row " + i.to_s}
    end
  end

  def timezone
  	begin
	    ActiveRecord::Base.transaction do

	      CSV.foreach(params[:file].path,:headers => true) do |row|
	      	# Create company
	      	language = TimezoneCde.find_or_create_by(country_abbreviation: row[1], name: row[2])
	      	language.save!
	      end
	    end
	    redirect_to imports_path, :notice => "Import TimeZoneCde success!"
	  rescue ActiveRecord::RecordInvalid => e
      render :status=> 401, :json => {:message=> e.record.errors.full_messages.join("\n ") + " at row " + i.to_s}
    end
  end

  def insurance_company
  	begin
	    ActiveRecord::Base.transaction do

	      CSV.foreach(params[:file].path,:headers => true) do |row|
	      	# Create insurance company
	      	#Id,Name,States,Address,Claims,Remittance advice,Eligibility,Electronic cob,Web site
	      	language = InsuranceCompany.find_or_create_by(name: row[1], states: row[2], :address => row[3], :claims => row[4], :remittance_advice => row[5], :eligibility => row[6], :electronic_cob => row[7], :web_site => row[8] )
	      	language.save(validate: false)
	      end
	    end
	    redirect_to imports_path, :notice => "Import InsuranceCompany success!"
	  rescue ActiveRecord::RecordInvalid => e
      render :status=> 401, :json => {:message=> e.record.errors.full_messages.join("\n ") + " at row " + i.to_s}
    end
  end

  def speciality
  	begin
	    ActiveRecord::Base.transaction do

	      CSV.foreach(params[:file].path,:headers => true) do |row|
	      	# Create insurance company
	      	#Id,Name,States,Address,Claims,Remittance advice,Eligibility,Electronic cob,Web site
	      	language = SpecialityCde.find_or_create_by(name: row[1])
	      	language.save!
	      end
	    end
	    redirect_to imports_path, :notice => "Import SpecialityCde success!"
	  rescue ActiveRecord::RecordInvalid => e
      render :status=> 401, :json => {:message=> e.record.errors.full_messages.join("\n ") + " at row " + i.to_s}
    end
  end

end