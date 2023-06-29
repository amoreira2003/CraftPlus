function writeCentered(text,delay,offset)
    if offset == nil then offset = 0 end
    local termWidth, termHeight = term.getSize()
    local x = math.floor((termWidth - #text) / 2)
    local y = math.floor(termHeight / 2) + offset
    term.setCursorPos(x, y)
    textutils.slowWrite(text,delay)
end
term.clear()
writeCentered("Welcome to Smart Switchs",20)
writeCentered("Press any key to start setup",20,1)
os.pullEvent("key")

function centerVerticalCursor(offset)
    local _, termHeight = term.getSize()
    local x = 1
    local y = math.floor(termHeight / 2) + offset
    term.setCursorPos(x, y)
end

term.clear()
writeCentered("Please type the connection URL",10)
writeCentered("HTTP/HTTPS AND PORTS SHOULD BE INCLUDED",10,8)
centerVerticalCursor(2)
local connectionUrl = io.read()

term.clear()
writeCentered("Creating connection.data",10)
local file = fs.open("connection.data", "w") -- Open the file in write mode
term.clear()
if file then
  file.write(connectionUrl) -- Write content to the file
  file.close() -- Close the file
  writeCentered("Writing " .. connectionUrl .." to the file",10)
else
    writeCentered("Failed to open the file for writing.",10)
    os.exit()
end

term.clear()
writeCentered("Trying to connect to the API",10)
local httpCheck = http.checkURL(connectionUrl)
if httpCheck == 'false' then
    term.clear()
    writeCentered("It was not possible to validate the URL",10)
    writeCentered("Read wiki for fix",10,1)
    os.exit()
end

term.clear()
writeCentered("Connection Setup Finished",10)
term.clear()
writeCentered("Press any key to Pair",10)
os.pullEvent("key")


term.clear()
writeCentered("Please type the name of the switch",10)
centerVerticalCursor(1)
local switchName = io.read()

term.clear()
writeCentered("Sending Pair Request to Server",10)
local payload = {name = switchName}
print(payload)

local customHeader = { ["Content-Type"] = "application/json"}

local pairResponse = http.post(connectionUrl.."/switchs/pair",textutils.serialiseJSON(payload),customHeader)

if pairResponse == nil then 
    term.clear()
    writeCentered("It was not possible to Pair",10)
    writeCentered("Read wiki for fix",10,1)
    os.exit()
end

local code, message = pairResponse.getResponseCode()

if not code == 200 then 
    term.clear()
    writeCentered("It was not possible to Pair",10)
    writeCentered("Error Code: " .. code,10,1)
    writeCentered("Error Message: " .. message,10,2)
    writeCentered("Read wiki for fix",10,3)
    os.exit()
end

local pairJson = textutils.unserializeJSON(pairResponse.readAll())
term.clear()
writeCentered("Creating pair.data file",10)
local pairData = fs.open("pair.data", "w") -- Open the file in write mode
term.clear()
if pairData then
    pairData.write(textutils.serialiseJSON(pairJson)) -- Write content to the file
    pairData.close() -- Close the file
    writeCentered("Writing Pair Data to the file",10)
else
    writeCentered("Failed to open the file for writing.",10)
    os.exit()
end

term.clear()
writeCentered("Deviced Paired Sucessfully",10)
writeCentered("Device UUID ",10,1)
writeCentered(pairJson.uuid,20,2)
writeCentered("Device Start Value: " .. tostring(pairJson.value),10,3)
writeCentered("Device Custom Name: " .. tostring(pairJson.name),10,4)
writeCentered("Press any key to download switch files",10,6)
os.pullEvent("key")
