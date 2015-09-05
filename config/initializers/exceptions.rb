# eTherapi custome Exception Handler
# Calls the ErrorsController when a 404 or 500 response is to be sent
require 'action_dispatch/middleware/show_exceptions'
 
module ActionDispatch
  class ShowExceptions
    private
      def render_exception_with_template(env, exception)
        puts 'Custom eTherapi exception renderer'
        body = ExceptionsController.action(rescue_responses[exception.class.name]).call(env)
        log_error(exception)
        body[1]['Content-Type']= "application/json; charset=utf-8"
        body
        rescue
          render_exception_without_template(env, exception)
      end
      alias_method_chain :render_exception, :template
  end
end