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

term.clear()
writeCentered("Would you like to install Smart Switch?")
writeCentered("Press any key to continue",1)
os.pullEvent("key")
term.clear()
writeCentered("Dowloading Utils File")
downloadFile('https://raw.githubusercontent.com/amoreira2003/AutomaticHouse/main/switch/utils.lua',"./smartSwitch/utils.lua")
term.clear()
writeCentered("Dowloading Main File")
downloadFile('https://raw.githubusercontent.com/amoreira2003/AutomaticHouse/main/switch/smartswitch.lua',"smartSwitch.lua")
term.clear()
writeCentered("Dowloading Startup Lock File")
downloadFile('https://raw.githubusercontent.com/amoreira2003/AutomaticHouse/main/switch/startup.lua',"startup.lua")
term.clear()
writeCentered("Press any key to start setup")
os.pullEvent("key")
os.reboot()
