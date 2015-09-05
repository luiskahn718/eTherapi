require 'rdoc/task'

RDoc::Task.new do |rdoc|
  puts "Generating documentation for eTherapi's site..."
  rdoc.title    = "eTherapi's site Documentation"
  rdoc.rdoc_dir = "doc"
  rdoc.rdoc_files.include("app/**")
  rdoc.rdoc_files.exclude("app/views/**")
  
  rdoc.rdoc_files.include("config/**")
  puts "Generating documentation for eTherapi's site for :"
  puts rdoc.rdoc_files.inspect 
end