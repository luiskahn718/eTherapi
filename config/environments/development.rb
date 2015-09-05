Etherapi::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = true

  # config.action_mailer.default_url_options = { host: '54.186.89.238'}
  config.action_mailer.default_url_options = { host: '54.187.155.251'}

  config.action_mailer.smtp_settings = {
      :address              => 'email-smtp.us-west-2.amazonaws.com',
      # :address              => 'smtp.gmail.com',
      :port                 => 587,
      # in previous Stackoverflow I read :domain part wasn't needed, so leave it out
      # :domain               => 'gmail.com',
      # :user_name            => 'klygdev@gmail.com',
      # :password             => 'kly6_d3v',
      # :user_name            => 'asnet.etherapi@gmail.com',
      # :password             => 'asnet@123',
      :user_name            => 'AKIAIZMGHKHNHET4WTPQ',
      :password             => 'AugEZ756PaXoVYQz7kK4UjoWpX13n/9dJOfJ9dK7+KJ7',
      :authentication       => 'plain',
      :enable_starttls_auto => true
  }

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  ## https://github.com/Coursemology/coursemology.org/issues/15
  # config.action_mailer.perform_deliveries = false

  ENV['PATH'] = "/usr/local/bin:#{ENV['PATH']}"
  ENV['PUBLISHABLE_KEY'] ="pk_test_AXEc9Ri7ynXzo8BBW9zCrOVW"
  ENV['SECRET_KEY']="sk_test_aczCNI8zh2xPwOQGyQxQFzlb"


end
