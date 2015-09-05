##
# Conversation Controller.
#
# This controller is responsible for the managememt of all conversation functioanlity
#
# Using the GEM Mailboxer
#
# [Ability Configuration]
# * Therapist can
#   1. :index
#   2. :show
#   3. :update
#   4. :create
#   5. :reply
#   6. :trash
#   7. :untrash
#   8. :mark_as_read
#
# * Patient can
#   1. :index
#   2. :show
#   3. :update
#   4. :create
#   5. :reply
#   6. :trash
#   7. :untrash
#   8. :mark_as_read
#
class ConversationsController < ApplicationController
  #Mailboxer API : http://rubydoc.info/gems/mailboxer/0.11.0/frames

  skip_before_filter  :json_verify_authenticity_token
  def json_verify_authenticity_token
    verify_authenticity_token unless request.json?
  end
  #Before precess filters
  before_filter :authenticate_user!

  authorize_resource :class => false

  helper_method :mailbox, :conversation

  ##
  # Create a New conversation
  #
  # Called from the Route : +POST+ \ /conversations(.:format) | conversations#create
  #
  # Calls template : views/conversation/index.html.haml
  #
  # [Returns]
  #
  #  [JSON parameter format]
  #     {"conversation":{"recipient_id": "45", "subject": "REST TEST", "body":"First REST Conversation"}}
  #
  # [NOTE]
  #    recipient_id - MUST be the user_id from the users model
  #
  def create
    #recipient_emails = conversation_params(:recipients).split(',')
    #recipients = User.where(email: recipient_emails).all
    recipient = User.find(params[:conversation][:recipient_id])

    conversation = current_user.send_message(recipient, *conversation_params(:body, :subject)).conversation

    respond_to do |format|
      format.html { redirect_to conversation}
      format.json { render :status => 200, :json => { action: :create}}
    end
  end

  ##
  # New conversation
  #
  # The recipient id must must be passed as recipient=x, in the URL. The recipient id MUST be the user_id from the users model
  #
  # Example : http://localhost:3000/conversations/new?recipient=45
  #
  # Called from the Route : +new_conversation+ | GET | /conversations/new(.:format) | conversations#new
  #
  # Calls template : views/conversation/new.html.haml
  #
  # [Returns]
  #    * @recipient
  #
  #  [JSON parameter format]
  #     {}
  #
  def new
    recipient_id = params[:recipient]
    @recipient = User.find(recipient_id).getProfileable

    respond_to do |format|
      format.html { redirect_to conversation}
      format.json { render :status => 200, :json => { action: :new, recipient: @recipient}}
    end

  end

  ##
  # Reply to a conversation
  #
  # Called from the Route : +reply_conversation+ | POST | /conversations/:id/reply(.:format) | conversations#reply
  #
  # Calls template : views/conversation/index.html.haml
  #
  # [Returns]
  #
  #  [JSON parameter format]
  #    {"message":{"body":"test reply", "subject":"REST TEST"}}
  #
  def reply
    current_user.reply_to_conversation(conversation, *message_params(:body, :subject))
    respond_to do |format|
      format.html { redirect_to conversation}
      format.json { render :status => 200, :json => { action: :reply}}
    end
  end

  ##
  # Trash a conversation
  #
  # Called from the Route : +trash_conversation+ | POST | /conversations/:id/trash(.:format) | conversations#trash
  #
  # Calls template : views/conversation/index.html.haml
  #
  # [Returns]
  #
  #  [JSON parameter format]
  #    {}
  #
  def trash
    conversation.move_to_trash(current_user)
    respond_to do |format|
      format.html { redirect_to conversation}
      format.json { render :status => 200, :json => { action: :trash}}
    end
  end

  ##
  # Untrash a conversation
  #
  # Called from the Route : +untrash_conversation+ | POST | /conversations/:id/untrash(.:format) | conversations#untrash
  #
  # Calls template : views/conversation/index.html.haml
  #
  # [Returns]
  #
  #  [JSON parameter format]
  #    {}
  #
  def untrash
    conversation.untrash(current_user)
    respond_to do |format|
      format.html { redirect_to conversation}
      format.json { render :status => 200, :json => { action: :untrash}}
    end
  end

  ##
  # Mark_as_read a conversation
  #
  # Called from the Route : +mark_as_read_conversation+ | POST | /conversations/:id/mark_as_read(.:format) | conversations#mark_as_read
  #
  # Calls template : views/conversation/index.html.haml
  #
  # [Returns]
  #
  #  [JSON parameter format]
  #    {}
  #
  def mark_as_read
    conversation.mark_as_read(current_user)
    respond_to do |format|
      format.html { redirect_to conversation}
      format.json { render :status => 200, :json => { action: :mark_as_read}}
    end
  end

  private

  ##
  # Returns the mailbox ofthe current user
  def mailbox
    @mailbox ||= current_user.mailbox
  end

  ##
  # Returns the conversation matching the id parameter passed to the controller
  def conversation
    @conversation ||= mailbox.conversations.find(params[:id])
  end

  ##
  # Parses the conversation parameters
  def conversation_params(*keys)
    fetch_params(:conversation, *keys)
  end

  ##
  # Parses the message parameters
  def message_params(*keys)
    fetch_params(:message, *keys)
  end

  ##
  # Fatches the subject and body from the message parameter
  def fetch_params(key, *subkeys)
    params[key].instance_eval do
      case subkeys.size
      when 0 then self
      when 1 then self[subkeys.first]
      else subkeys.map{|k| self[k] }
      end
    end
  end

end
