const express = require("express");
const app = express();
var cors = require('cors');
const { uuid } = require('uuidv4');

const port = 3100;

const switchs = [{uuid: 0,value: false},{uuid: 1,value: false}]

app.use(express.json())
app.use(cors());


function checkIfUUIDInUse(uuid) {
    for(var switche in switchs) {
        if(switche.uuid == uuid) return true;
    }

    return false;
    
}
function pairSwitch() {
    const newSwitchUUID = uuid();
    if(checkIfUUIDInUse(newSwitchUUID)) return false;

    switchs[switchs.length+1] = {uuid: newSwitchUUID, value: false}
    return true;
}

app.get("/switchs/:switchId", (req,res) => {
    const uuid = req.params.switchId;
    if(uuid == "all") {
        res.status(200).send(switchs);
        return;
    }
    res.status(200).send(switchs[uuid].value)
})


app.post("/switchs/:switchId", (req,res) => {
   const switchId = req.params.switchId;
   const {uuid,value} = req.body;
   console.log("Requested POST State from UUID ->" + uuid);

   if(switchId == null || switchId == '') {
    if(pairSwitch()) {
        res.status(200).send("New Switch Paired");
        return;
    } 
    res.status(500).send("The server was unable to pair a new switch")
    return;
   }
   
   switchs[uuid].value = value;
   console.log(req.body)
   console.log(switchs)
   res.status(200).send();
})


app.listen(port,() => {
    console.log("We running on port " + port)
})