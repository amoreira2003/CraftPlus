const fs = require('fs');

function saveDataFile(data) {
    try {
      fs.writeFileSync('data.json', JSON.stringify(data), 'utf8');
      console.log('JSON file has been saved.');
    } catch (error) {
      console.error('Error writing JSON file:', error);
    }
    
  }


  function saveDataFileAsync(data) {
      fs.writeFile('data.json', JSON.stringify(data), 'utf8', (err) => { if(err) console.error('Error writing JSON file:', err); return;});
      console.log('JSON file has been saved Asynchronously.');
  }
  
  
  
  function readDataFile() {
    try {
      if (!fs.existsSync('data.json')) {
        fs.writeFileSync('data.json', '[]');
        console.log('Empty file has been created.');
      } else {
        console.log('File already exists. Starting Reading Process');
      }
  
      const jsonData = fs.readFileSync('data.json', 'utf8');
      const data = JSON.parse(jsonData);
      console.log('Read JSON file:', data);
      return data;
    } catch (error) {
      console.error('Error reading or creating JSON file:', error);
      return null;
    }
  }

module.exports = {
    readDataFile,saveDataFile,saveDataFileAsync
}