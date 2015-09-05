module Outboundmail
  require "curb"
  require "json"
  
  @url_identity = "http://api.outbound.io/api/v1/identify"
  @url_event = "http://api.outbound.io/api/v1/track"
  @apikey = Rails.configuration.outbound_io_apikey

  def self.register_user(user)
    user_info = {
      :first_name => user.first_name,
      :last_name => user.last_name,
      :name => user.first_name + ' ' + user.last_name,
      :email => user.email,
      :account_type => user.account_type
    }
    
    payload = {"api_key" => @apikey,
      "user_id" => user.user_id,
      "traits" => user_info
    } 
    send_outbound_trx(@url_identity, user.user_id, payload)
  end

  def self.outbound_admin_notification(eventname, user, event_properties)
    self.outbound_event('admin_' + eventname, user, event_properties)
  end

  def self.outbound_event(eventname, user, event_properties)
    user_id = user.user_id
    payload = {"api_key" => @apikey,
      "user_id" => user_id,
      "event" => eventname,
      "payload" => event_properties
    } 
    send_outbound_trx(@url_event, user_id, payload)
  end

  private

  def self.send_outbound_trx(url, user_id, payload)
    payload = payload.to_json
    puts payload
    ####Start of HTTP Request
    headers = {}
    headers["Accept"] = "application/json"
    headers["Content-Type"] = "application/json"
    request = Curl::Easy.new
    request.url = url
    request.verbose = true
    request.headers=headers
    request.ssl_verify_peer = false
    request.ssl_verify_host = false

    request.http_post(payload)

    parsed = JSON.parse(request.body_str).to_h
    if request.response_code == 200
      puts "################ Outbound success"
      puts parsed
    else
      puts "################ Outbound Failure !!!!!!!!!!!!!!!!!!!"
      puts parsed
    end

    request.close

  end

end
