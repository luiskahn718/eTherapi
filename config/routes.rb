Etherapi::Application.routes.draw do
# Home route
  root :to => "home#index"

  devise_for :users, :controllers => {:registrations => "registrations", :confirmations => "confirmations", :invitations => "invitations", :sessions => "sessions", :passwords => "passwords"}

  #Resources
  resources :users, only: [:edit, :update] do
    collection do
      get :admin_reset_password
      put :update_password
      put :update_account
    end
  end

  resources :dashboards, only: [:index]

  resources :appointments do
    collection do
      get :pending
    end
    member do
      get :get_session_log
      get :accept
      get :session
      get :decline
    end
  end

  match 'code_tables/get_code_table/:code_table_name' => 'code_tables#get_code_table', :via => :get, :as => "get_code_table", :defaults => { :format => 'json' }

  resources :conversations, only: [:index, :show, :new, :create] do
    member do
      post :reply
      post :trash
      post :untrash
      post :mark_as_read
    end
  end

  resources :notes, only: [:show, :update, :create] do
    collection do
      get :get_patient_notes
      get :get_patient_notes_for_type
      get :get_session_notes
    end
  end

  match 'patient/save_avatar' => 'patient#save_avatar', :via => :post, :as => "patient_save_avatar"
  match 'patient/get_avatar' => 'patient#get_avatar', :via => :get, :as => "patient_get_avatar"
  match 'patient/remove_avatar' => 'patient#remove_avatar', :via => :put, :as => "patient_remove_avatar"
  match 'patient/get_patient_info' => 'patient#get_patient_info', :via => :get, :as => "patient_get_patient_info"
  
  resources :patient, only: [:show, :edit, :update] do
    member do
      get :accept_invitation_from
    end
    collection do
      get :payment
      get :info
    end
  end
  resources :patient_profile_steps

  match 'therapist/searchform' => 'therapist#searchform', :via => :get, :as => "therapist_searchform"
  match 'therapist/search' => 'therapist#search', :via => :get, :as => "therapist_search"
  match 'therapist/searchresult' => 'therapist#searchresult', :via => :get, :as => "therapist_searchresult"
  match 'therapist/getpatientlist' => 'therapist#get_patient_list', :via => :get, :as => "therapist_getpatients"
  match 'therapist/patient/:patient_id' => 'therapist#patient', :via => :get, :as => "therapist_patient"
  match 'therapist/save_avatar' => 'therapist#save_avatar', :via => :post, :as => "therapist_save_avatar"
  match 'therapist/get_avatar' => 'therapist#get_avatar', :via => :get, :as => "therapist_get_avatar"
  match 'therapist/remove_avatar' => 'therapist#remove_avatar', :via => :put, :as => "therapist_remove_avatar"
  match 'therapist/get_relate_info' => 'therapist#get_relate_info', :via => :get, :as => "therapist_get_relate_info"
  resources :therapist do
    get "/profile", :action => 'profile'
    resources :availability, only: [:index, :show, :update]
  end

  resources :therapist_consents , only: [:index, :show, :edit, :create, :new, :update] do
    member do
      get 'acknowledge/:patient_id', :action => 'acknowledge'
    end
  end

  resources :therapist_profile_steps

  resources :session_log, only:[:update]
  match 'session_log/join/:appointment_id' => 'session_log#join', :via => :get, :as => "session_join"
  match 'session_log/getVSeeExitURI' => 'session_log#getVSeeExitURI', :via => :get, :as => "session_getVSeeExitURI"
  resources :session, only:[:index]

  match 'eligible/coverage' => 'eligible#coverage', :via => :post, :as => "eligible_coverage"
  match 'eligible/retrieve/:patient_id' => 'eligible#retrieve', :via => :get, :as => "eligible_retrieve"

  # NEWEST code from bitbucket
  # noted for checking
  #match 'charges/listcards/:stripe_customer_id' =>  'charges#listcards', :via => :get, :as => "charges_listcards"

  match 'charges/getpublishablekey' =>  'charges#getpublishablekey', :via => :get, :as => "charges_getpublishablekey"
  match 'charges/createcustomer/:stripeToken' =>  'charges#createcustomer', :via => :put, :as => "charges_createcustomer"
  match 'charges/createprecharge' =>  'charges#createprecharge', :via => :post, :as => "charges_createprecharge"
  match 'charges/listcards' =>  'charges#listcards', :via => :get, :as => "charges_listcards"
  match 'charges/addcard' =>  'charges#addcard', :via => :put, :as => "charges_addcard"
  match 'charges/deletecard' =>  'charges#deletecard', :via => :put, :as => "charges_deletecard"
  match 'charges/defaultcard' =>  'charges#defaultcard', :via => :put, :as => "charges_defaultcard"
  match 'charges/createtoken' =>  'charges#createtoken', :via => :get, :as => "charges_createtoken" # will remove
  match 'charges/chargecustomer' => 'charges#chargecustomer', :via => :post, :as => "charges_chargecustomer" # will remove
  # match 'charges/retrieve_charge' => 'charges#retrieve_charge', :via => :get
  #resources :charges
  #get 'charges/create' => 'charges#create'

  resources :patient_payment_cards

  ## Custom Home page
  match 'home/custom_index' => 'home#custom_index', :via => :get
  #static pages
  get "site/faq"
  get "site/terms"
  get "site/about"
  get "site/support"
  get "site/press"
  get "site/security"
  get "site/contact"
  get "site/pricing"
  get "site/privacy"
  get "site/blog"
  get "site/map"
  get "site/therapist"

  # debug dashboard
  resources :debug do
    collection do
      get :therapist_without_any_appointment
      get :therapist_with_confirm_and_pending_appointment
      get :therapist_with_all_pending_appointment
      get :therapist_with_all_cancel_appointment
      get :therapist_with_all_cancel_request_upcomming_appointment
      get :therapist_with_canceled_appoitment_over_24h
      get :therapist_with_canceled_appoitment_in_24h
      get :normal_patient_with_request_upcomming_cancle_appointment
      get :therapist_with_patient_has_medical_histories
      get :login_with_therapist_without_any_appointment
      get :login_with_therapist_with_confirm_and_pending_appointment
      get :login_with_therapist_with_patient_has_medical_histories
      get :login_with_therapist_with_all_pending_appointment
      get :login_with_therapist_with_all_cancel_request_upcomming_appointment
      get :login_with_therapist_with_canceled_appoitment_in_24h
      get :login_with_therapist_with_canceled_appoitment_over_24h
      get :login_with_normal_patient_with_request_upcomming_cancle_appointment
    end
  end

  # match 'account_info' => 'accounts#show', :via => :get
  resources :profiles, only:[:show]

  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)

  resources :imports do
    collection do
      post :language
      post :state
      post :country
      post :timezone
      post :insurance_company
      post :speciality
    end
  end

end
