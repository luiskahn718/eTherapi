class ToHaml
  def initialize(path)
    puts "Initialized with #{path}"
    @path = path
  end

  def convert!
    Dir["#{@path}/**/*.erb"].each do |file|
      puts "Converting #{file}"
      `html2haml -rx #{file} #{file.gsub(/\.erb$/, '.haml')}`
    end
  end
end

path = File.join(File.dirname(__FILE__), 'app', 'views')

ToHaml.new(path).convert!