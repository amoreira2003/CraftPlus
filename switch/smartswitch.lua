local utils = require("smartSwitch/utils")
connectionUrl = ''
local switchUuid = utils.uuid()

local running = true


function handleMessages(socket, message)
  writeCentered(message)
  local jsonMessage = textutils.unserializeJSON(message)
  if not jsonMessage then
    term.clear()
    writeCentered("Unformatted Message from Server: ")
    writeCentered(message,1)
    return
  end

  if jsonMessage.type == 'pairRequestCompleted' then
    term.clear()
    writeCentered("Creating pair.data file")
    utils.writeToPairFile(socket, jsonMessage.payload)
    term.clear()
    os.reboot()
  elseif jsonMessage.type == 'connectSuccess' then
    term.clear()
    writeCentered("Connecting was a success, enjoy!")
    redstone.setOutput("right", jsonMessage.payload.currentValue)
  elseif jsonMessage.type == 'connectFailed' then
    term.clear()
    writeCentered("Connecting was a failure")
    writeCentered(jsonMessage.payload.reason, 1)
  elseif jsonMessage.type == 'changeValue' then
    term.clear()
    writeCentered("Switch Toggle To: " .. tostring(jsonMessage.payload.switchValue))
    redstone.setOutput("right", jsonMessage.payload.switchValue)
  end
end

if not fs.exists("smartSwitch/connection.data") then
  term.clear()
  writeCentered("Welcome to Smart Switchs")
  writeCentered("Press any key to start setup", 1)
  os.pullEvent("key")

  term.clear()
  writeCentered("Please type the connection URL")
  utils.centerVerticalCursor(1)
  connectionUrl = 'ws://' .. io.read()

  term.clear()
  writeCentered("Creating connection.data")
  local file = fs.open("smartSwitch/connection.data", "w")
  term.clear()
  if file then
    file.write(connectionUrl)
    file.close()
    writeCentered("Writing " .. connectionUrl .. " to the file")
  else
    writeCentered("Failed to open the file for writing.")
  end
else
  local file = fs.open("smartSwitch/connection.data", "r")  

  if file then
    local fileContent = file.readAll()
    file.close()
    connectionUrl = fileContent
  end
end

term.clear()
writeCentered("Trying to connect to the server")
writeCentered(connectionUrl,1)
local socket = http.websocket(connectionUrl)
if not socket then
  term.clear()
  writeCentered("It was not possible connect")
  os.reboot()
end

if not fs.exists("smartSwitch/pair.data") then
  local data = {
    type = "pairRequest",
    payload = {
      uuid = switchUuid
    }
  }
  socket.send(textutils.serialiseJSON(data))
  term.clear()
  writeCentered("Sending Pair Request")
else
  local file = fs.open("smartSwitch/pair.data", "r")
  if file then
    local fileContent = file.readAll()
    file.close()
    local pairData = textutils.unserializeJSON(fileContent)

    local data = {
      type = "authenticate",
      payload = {
        devType = "switch",
        uuid = pairData.uuid
      }
    }

    socket.send(textutils.serialiseJSON(data))
  else
    writeCentered("Failed to open pair file.")
  end
end


while running do
  local event, url, message = os.pullEventRaw()
  if event == 'websocket_message' then
    if not url == connectionUrl then return end
    handleMessages(socket, message)
  elseif event == "terminate" or event == "shutdown" then
    if socket then socket.close() end
    running = false;
  end
end
