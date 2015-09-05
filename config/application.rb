require File.expand_path('../boot', __FILE__)

# Pick the frameworks you want:
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "sprockets/railtie"

require "csv"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Etherapi
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Suppress rspec generation of test for views and controller
    config.generators do |g|
      g.view_specs false
      g.helper_specs false
      config.i18n.enforce_available_locales = true
      config.assets.paths << Rails.root.join('vendor', 'assets', 'components')
    end
    # change default layout for devise
    # http://stackoverflow.com/questions/11082213/changing-devise-default-layouts
    config.to_prepare do
      # Devise::SessionsController.layout "main"
      # Devise::RegistrationsController.layout "main"
      # Devise::ConfirmationsController.layout "main"
      # Devise::UnlocksController.layout "main"
      Devise::PasswordsController.layout "public"
    end
    config.autoload_paths += Dir["#{config.root}/lib/"]

    Rails.configuration.admin_email = "yanickg@nimbus-t.com"
    Rails.configuration.outbound_io_apikey = "ea81e8f93b4243aa6b5c38c4e87a778c"
  end
end
