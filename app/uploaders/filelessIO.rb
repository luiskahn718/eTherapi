class FilelessIO < StringIO
    attr_accessor :original_filename
    
    def self.base64_decoder(encoded_stream, file_name)
      io = FilelessIO.new(Base64.decode64(encoded_stream))
      io.original_filename = file_name
      return io
    end
end