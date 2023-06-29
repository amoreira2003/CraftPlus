const express = require("express");
const app = express();
var cors = require('cors');
const { uuid } = require('uuidv4');
const fs = require('fs');

const port = 3100;

var switchs;

app.use(express.json())
app.use(cors());

function init() {
    readDataFile();
}

function saveDataFile() {
    fs.writeFile('data.json', JSON.stringify(switchs), 'utf8', (err) => {
        if (err) {
          console.error('Error writing JSON file:', err);
          return;
        }
        console.log('JSON file has been saved.');
        })
}

function readDataFile() {
    fs.access('data.json', fs.constants.F_OK, (err) => {
        if (err) {
          fs.writeFile('data.json', '[]', (err) => {
            if (err) {
              console.error('Error creating empty file:', err);
              process.exit(1)
            }
            console.log('Empty file has been created.');
            return;
          });
        } else {
          console.log('File already exists. Starting Reading Process');
          return;
        }
      });

      fs.readFile('data.json', 'utf8', (err, jsonData) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          return;
        }

        const data = JSON.parse(jsonData);
        switchs = data;
        console.log('Read JSON file:', data);
    })
}

function getObjectIndexByUUID(uuid) {
    for (let i = 0; i < switchs.length; i++) {
        if (switchs[i].uuid === uuid) {
            return i;
        }
    }
    return -1; // Return -1 if the UUID is not found
}
function checkIfUUIDInUse(uuid) {
    for(var switche in switchs) {
        if(switche.uuid == uuid) return true;
    }
    return false;
}
function pairSwitch(switchName) {
    const newSwitchUUID = uuid();
    if(checkIfUUIDInUse(newSwitchUUID)) return false;
    console.log("Pairing:" + switchName)
    switchs.push({uuid: newSwitchUUID, value: false,name: switchName})
    saveDataFile()
    readDataFile()
    return true;
}

app.get("/switchs/:switchId", (req,res) => {
    const uuid = req.params.switchId;
    if(uuid == "all") {
        res.status(200).send(switchs);
        return;
    }
    res.status(200).send(switchs[getObjectIndexByUUID(uuid)])
})


app.post("/switchs/:switchId", (req,res) => {
   const switchId = req.params.switchId;
   if(switchId == 'pair') {
    console.log(req.body)
    const switchName = req.body.name;
    if(switchName == '' || switchName == null) {
      res.status(500).send("Empty Names are not Allowed")
      return;
    }
    if(pairSwitch(switchName)) {
        res.status(200).send(switchs[switchs.length-1]);
        return;
    } 
    res.status(500).send("The server was unable to pair a new switch")
    return;
   }
   const value = req.body.value;
   console.log("Requested POST State from UUID -> " + switchId);
   switchs[getObjectIndexByUUID(switchId)].value = value;
   res.status(200).send("Switch Toggled");
})

app.listen(port,() => {
    init()
    console.log("We running on port " + port)
})