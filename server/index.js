const WebSocket = require('ws');
const { saveDataFile, readDataFile, saveDataFileAsync } = require('./utils/fileManager')
const { canParseJSON, checkIfUUIDInUse, getKeyByValue } = require('./utils/dataUtils')
var switchList;


const pairRequests = {}

const connections = {
  switches: {},
  clients: []
}


switchList = readDataFile()
console.log("What is Switch List ", switchList)


const wss = new WebSocket.Server({ port: 3100 });

function pairSwitch(payload) {
  console.log("Payload: ", payload)
  console.log("Switch List Before Saving File: ", switchList)
  switchList[payload.uuid] = payload
  saveDataFile(switchList)
  console.log("Switch List After Saving File: ", switchList)
  sendReactClientsMessage(JSON.stringify({ type: 'syncInformation', payload: { switchList: switchList} }))
  return true;
}

function sendReactClientsMessage(message) {
  for (var webSocketRCIndex in connections.clients) {
    var webSocketRC = connections.clients[webSocketRCIndex];
    webSocketRC.send(message)
  }
}


function handleAuthentication(ws, message) {
  const payload = message.payload
  switch (payload.devType) {
    case "reactClient":
      connections.clients.push(ws);
      ws.send(JSON.stringify({ type: 'syncInformation', payload: { switchList: switchList} }))
      console.log("Clients Length: " + connections.clients.length)
      break;
    case "switch":
      if (switchList[payload.uuid] == null) {
        console.log("Connection Failed: Device Not Paired")
        console.log("Switch List: ", switchList)
        console.log("Payload UUID: ", payload.uuid)
        console.log("Switch List Ask UUID Object: ", switchList[payload.uuid])
        ws.send(JSON.stringify({ type: 'connectFailed', payload: { reason: "Device is not paired" } }))
        return;
      }

      const switchObject = switchList[payload.uuid];
      switchObject.connected = true;
      connections.switches[payload.uuid] = ws
      ws.send(JSON.stringify({ type: 'connectSuccess', payload: {currentValue: switchObject.value}}))
      console.log("Switch List: ", switchList)
      console.log("Switch Connections: ", connections.switches)
      console.log("Pair Request: ", pairRequests)
      sendReactClientsMessage(JSON.stringify({ type: 'syncInformation', payload: { switchList: switchList} }))
      break;

    default:
      console.log("Unknown Device Type: ", payload.devType)
      break;
  }
}

function handlePairRequest(ws, request) {
  const switchUUID = request.payload.uuid;
  if (checkIfUUIDInUse(switchUUID)) return; // Send Fail Pair ID Already in Use Error
  let data = JSON.stringify({ type: 'pairRequestInformation', payload: { uuid: switchUUID } })
  pairRequests[switchUUID] = ws;
  console.log(pairRequests)
  sendReactClientsMessage(data)

}

function finishPair(pairData) {
  const { uuid, customName } = pairData.payload

  if (pairSwitch(pairData.payload)) {
    const pairConnection = pairRequests[uuid];
    console.log("Sending Pair Complete Message to ",uuid)
    pairConnection.send(JSON.stringify({ type: 'pairRequestCompleted', payload: pairData.payload }))
    pairConnection.close()
    pairRequests[uuid] = null
    sendReactClientsMessage(JSON.stringify({ type: 'pairRequestCompleted', payload: pairData.payload }))
    return;
  }
  // Handle if pair failed

}

function handleSwitchToggle(command) {
  const {uuid, value} = command.payload
  if(connections.switches[uuid] == null) {
    switchList[uuid].connected = false; 
    sendReactClientsMessage(JSON.stringify({ type: 'syncInformation', payload: { switchList: switchList} }))
    return;
  } 

  switchList[uuid].value = value;
  console.log(switchList)
  saveDataFileAsync(switchList)
  sendReactClientsMessage(JSON.stringify({ type: 'syncInformation', payload: { switchList: switchList} }))
  connections.switches[uuid].send(JSON.stringify({ type: 'changeValue', payload: { switchValue: value} }))
}



wss.on('connection', (ws) => {


  ws.on('message', (message) => {
    message = message.toString('utf-8')
    console.log("Message: ", message)

    if (!canParseJSON(message)) {
      console.log("Unformatted Message Received (Not JSON): " + message)
      return;
    }

    const messageObject = JSON.parse(message)

    switch (messageObject.type) {
    
      case 'authenticate':
        handleAuthentication(ws, messageObject)
        break;
      case 'pairRequest':
        handlePairRequest(ws, messageObject)
        break;

      case 'pairRequestFinish':
        finishPair(messageObject)
        break;

      case 'toggleSwitch':
      handleSwitchToggle(messageObject)
      break;

      default:
        console.log("Unstructured Command Received: " + message)
        break;
    }
  });

  ws.on('close', () => {
    const indexClient = connections.clients.indexOf(ws);
    if (indexClient !== -1) {
      console.log("The following clients disconnected:", connections.clients[indexClient])
      connections.clients.splice(indexClient, 1)
    }
     var key =  getKeyByValue(connections.switches,ws)
     if (key != null) {
      const switchObject = switchList[key];

      if (switchObject == null) return;
      switchObject.connected = false;
      sendReactClientsMessage(JSON.stringify({ type: 'syncInformation', payload: { switchList: switchList} }))
      connections.switches[key] = null;
      return
    }
  });
});

console.log('WebSocket server is running on port 3100');