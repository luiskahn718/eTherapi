class Ability
  include CanCan::Ability

  def initialize(user)
    # Define abilities for the passed in user here.
    user ||= User.new # if user is nil create an empty user (guess)
    can [ :get_code_table], :code_table # everybody is allowed to get the codetables
    if !user.account_type.blank?
      if user.is_admin?
        can :manage, User
        can [ :search, :index, :profile, :show, :searchform, :searchresult], :therapist
        can [ :index, :show], :patient
        can [ :index, :show ], :dashboard
        #can [:admin_reset_password], :user
        can [ :index, :show, :new, :create, :reply, :trash, :untrash], :conversation
      elsif user.is_therapist?
        can :manage, User, :id => user.id
        can [ :index, :show ], :dashboard
        can [ :index, :show, :update, :create], :therapist_profile_step
        can [ :index, :show, :update, :create, :profile, :patient, :searchform, :search, :get_patient_list, :save_avatar, :get_avatar, :remove_avatar, :searchresult, :get_relate_info], :therapist
        can [ :index, :show, :update, :create, :edit, :acknowledge], :therapist_consent
        can [ :index, :show, :update, :create], :availability
        can [ :index, :update, :join, :getVSeeExitURI], :session_log
        can [ :index, :show, :update, :create, :get_patient_notes, :get_patient_notes_for_type, :get_session_notes], :note
        can [ :index, :show, :update, :create, :pending, :accept, :decline, :destroy, :get_session_log], :appointment
        can [ :index, :show, :new, :create, :reply, :trash, :untrash, :mark_as_read], :conversation
        can [ :chargecustomer], :charge
      elsif user.is_patient?
        puts " # info Patient user access"
        can :manage, User, :id => user.id
        can [ :index, :search, :searchform, :profile, :searchresult], :therapist
        can [ :acknowledge], :therapist_consent
        can [ :index, :update, :create, :show, :all ], :patient_profile_step
        can [ :update, :show, :edit, :accept_invitation_from, :save_avatar, :get_avatar, :remove_avatar, :payment, :info, :get_patient_info ], :patient
        can [ :index, :show ], :dashboard
        can [ :index, :update, :join, :getVSeeExitURI], :session_log
        can [ :index, :show, :update, :create, :pending, :accept, :decline, :get_session_log], :appointment
        can [ :index, :show, :new, :create], :patient_payment_cards
        can [ :index, :show, :new, :create, :reply, :trash, :untrash, :mark_as_read], :conversation
        can [ :createcustomer, :listcards, :createprecharge, :chargecustomer, :addcard, :deletecard, :defaultcard, :getpublishablekey, :createtoken ], :charge
      end
    else #Guest user - Limited access
      puts " # info Guess user access"
      can [ :search, :searchresult, :index, :profile, :searchform], :therapist
      can [ :index ], :availability

    end
    #
    # The first argument to `can` is the action you are giving the user
    # permission to do.
    # If you pass :manage it will apply to every action. Other common actions
    # here are :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on.
    # If you pass :all it will apply to every resource. Otherwise pass a Ruby
    # class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the
    # objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details:
    # https://github.com/bryanrite/cancancan/wiki/Defining-Abilities
  end
end
