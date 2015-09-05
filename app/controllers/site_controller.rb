class SiteController < ApplicationController
  def about
  end

  def faq
  end

  def press
  end

  def security
  end

  def support
  end

  def terms
    ## add default gon
    gon.push({})
    if current_user.present?
      if current_user.account_type.downcase == "therapist"
        @patientlist = TherapistPatient.get_my_patients current_user.getProfileable.user_id
        gon.push({ :patientlist => @patientlist })
      end
    end
    render :layout => "terms"
  end

  def contact
  end

  def pricing
  end

  def blog
  end

  def privacy
  end

  def map
  end

  ### use for therapist home page
  def therapist
    ###push gon
    gon.push({
      :speciality_cdes => SpecialityCde.all,
      :state_cdes => StateCde.all.order(:name),
      :license_type_cdes => LicenseTypeCde.all,
      :insurance_payers_names => InsurancePayersName.all,
      :user => current_user || []
      })
    render :layout => "main_home"
  end

end
