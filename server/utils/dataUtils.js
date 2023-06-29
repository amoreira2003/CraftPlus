
function canParseJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      console.log("Couldn't parse json: ", jsonString)
      return false;
    }
  }

  function checkIfUUIDInUse(uuid,switchArray) {
    for(var swt in switchArray) {
        if(swt.uuid == uuid) return true;
    }
    return false;
  }

  function getKeyByValue(object, value) {
    for (const key in object) {
      if (object.hasOwnProperty(key) && object[key] === value) {
        return key;
      }
    }
    return null; // Return null if the value is not found
  }

module.exports = {
    canParseJSON,checkIfUUIDInUse,getKeyByValue
}