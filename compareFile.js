var csvtojson = require('csvtojson');

const autoFilePath = './ns112.csv';
const manualFilePath = './ns222.csv';

(async () => {
  try {
    let jsonArray = await csvtojson().fromFile(autoFilePath);
    let newArray = await csvtojson().fromFile(manualFilePath);
    console.log('newArray ==', newArray[0]);
    console.log('jsonArray ==', jsonArray[0]);
    let nfound = [];
    newArray.forEach((na) => {
      let found = false;
      jsonArray.forEach((ja) => {
        // Change Subnets to Host IP
        if (na['Host IP'] == ja['Host IP']) {
          found = true;
          // Change Status to Host Names
          if (na['Host Names'] != ja['Host Names'] && na['Host IP']) {
            nfound.push(na['Host IP']);
          }
        }
      });
      if (!found && na['Host IP']) {
        nfound.push(na['Host IP']);
      }
    });
    console.log('found here===', nfound);
  } catch (err) {
    console.log(err);
  }
})();
