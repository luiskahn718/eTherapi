source 'http://rubygems.org'
source 'http://rails-assets.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 4.0.0'
gem 'railties' #, '4.0.0'
gem 'activerecord', '~> 4.0.4'
gem 'composite_primary_keys', '~> 6.0.5'

# Use to email ActionMailer and messaging
gem 'actionmailer', '~> 4.0'
gem 'mailboxer', '~> 0.11.0'
# Use to paginate long queries
gem 'kaminari'

# Use mysql as the database for Active Record
gem 'mysql2'

# Use Devise for user management
#gem 'devise'
gem 'devise', '~> 3.2'
gem 'devise_invitable', '~> 1.3.4'
gem 'devise_security_extension'
# Use Cancancan for role authorisation
gem 'cancancan', '~> 1.7'

# Use for administrative tasks
gem 'activeadmin', github: 'gregbell/active_admin'

# Use to Wizard-ify the registration process
gem 'wicked'

# Use for Avatar processing
gem 'carrierwave'
gem 'mini_magick', github: 'minimagick/minimagick'

# Use for Scheduling
gem 'ice_cube'
gem 'curb'

# Use for Credit Card Payments
gem 'stripe', :git => 'https://github.com/stripe/stripe-ruby'

# Use for Patient Insurance Eligibility testing and copayments
gem 'eligible'

# Use SCSS for stylesheets
gem 'bootstrap-sass'
gem 'sass-rails', '~> 4.0.2'

# Use HAML Template engine
gem 'haml'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '~> 4.0.0'
gem 'requirejs-rails'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2'
gem 'nested_form'
gem 'simple_form'
gem "ransack", github: "activerecord-hackery/ransack", branch: "rails-4"
# Gem used for Development and test only
group :development, :test do
	# Testing with rspec-rails and Capybara
	gem 'rspec-rails' #, '~> 3.0.0.beta'
	gem 'capybara', '>= 1.1.2'

	# Email test gem
	gem 'email_spec', '>= 1.2.1'
    gem 'spork-rails'
    gem 'pry-rails'
end
group :test do
    gem 'spork'
    gem 'cucumber-rails', '1.4.0', :require => false
    gem 'database_cleaner'
    gem 'rb-fsevent'

    # Guard plugins
    gem 'guard-livereload'
    gem 'guard-spork'
    gem 'guard-rspec'
    gem 'guard-spring'
    gem 'guard-cucumber'
    gem 'shoulda-matchers'
    gem 'guard-bundler'
end

gem 'gon' # pass page-specific variables (e.g. ENV values) to Javascript/Coffeescript
gem 'faker', '~> 1.3.0'
group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'rdoc', require: false
  gem 'sdoc', require: false
end


gem 'foreigner' ##Foreigner introduces a few methods to your migrations for adding and removing foreign key constraints. It also dumps foreign keys to

# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano', group: :development

# Use debugger
# gem 'debugger', group: [:development, :test]
