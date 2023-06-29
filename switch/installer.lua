function writeCentered(text,offset)
    if offset == nil then offset = 0 end
    local termWidth, termHeight = term.getSize()
    local x = math.floor((termWidth - #text) / 2)
    local y = math.floor(termHeight / 2) + offset
    term.setCursorPos(x, y)
    term.write(text)
end

function downloadFile(url, filePath)
    local request = http.get(url)
    
    if request.getResponseCode() == 200 then
      local response = request.readAll()
      local file = fs.open(filePath, "w")
      file.write(response)
      file.close()
      print("File downloaded successfully!")
    else
      print("Failed to download file. Error code: " .. request.getResponseCode())
    end
    
    request.close()
  end


writeCentered("Would you like to install Smart Switch?")
os.pullEvent("key")
writeCentered("Dowloading Utils File")
downloadFile('utilsUrl',"./smartSwitch/utils.lua")
writeCentered("Dowloading Main File")
downloadFile('mainFileUrl',"./smartSwitch/utils.lua")
writeCentered("Dowloading Startup Lock File")
downloadFile('startupUrl',"startup.lua")
writeCentered("Press any key to start setup")
os.pullEvent("key")
os.reboot()
