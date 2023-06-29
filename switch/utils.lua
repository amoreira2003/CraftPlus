function writeCentered(text,offset)
    if offset == nil then offset = 0 end
    local termWidth, termHeight = term.getSize()
    local x = math.floor((termWidth - #text) / 2)
    local y = math.floor(termHeight / 2) + offset
    term.setCursorPos(x, y)
    term.write(text)
end

function centerVerticalCursor(offset)
    local termWidth, termHeight = term.getSize()
    local x = 1
    local y = math.floor(termHeight / 2) + offset
    term.setCursorPos(x, y)
end


function writeToPairFile(socket, data)
    local pairData = fs.open("smartSwitch/pair.data", "w") -- Open the file in write mode
  
    if pairData then
      pairData.write(textutils.serialiseJSON(data)) -- Write content to the file
      pairData.close()                              -- Close the file
      print("Writing Pair Data to the file", 10)
    else
      print("Failed to open the file for writing.", 10)
      local data = {
        type = "failedToPair",
        payload = {
          uuid = switchUuid,
          failedReason = "Couldn't write to pair file."
        }
      }
      socket.send(textutils.serializeJSON(data))
    end
  end


function uuid()
    math.randomseed(os.time())
    local random = math.random
    local template ='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return string.gsub(template, '[xy]', function (c)
        local v = (c == 'x') and random(0, 0xf) or random(8, 0xb)
        return string.format('%x', v)
    end)
end

return { uuid = uuid, writeCentered = writeCentered, writeToPairFile = writeToPairFile, centerVerticalCursor = centerVerticalCursor }