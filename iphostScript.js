let fs = require('fs');
let XLSX = require('xlsx');

const logFileName = '172-15-50.txt';
const excelFileName = 'Network Scanning Report.xlsx';
const workbook1 = 'Network discovered';
const workbook2 = 'host in network';

// Use fs.readFile() method to read the file
fs.readFile(logFileName, 'utf8', function (err, wholeData) {
  if (err) {
    console.log('err====', err);
    return null;
  }
  // Split the records with new Line
  let newData = wholeData.split('\n');

  // Fetch Valid data, i.e remove records that does not have IPs like 'Host is up.'
  let fileData = newData.filter((ft) => ft.match(/\./g) && ft.match(/\./g).length > 2);
  let excelData = [];
  let netDisc = [];
  let isDiscovered;
  let subnet;
  //   Iterate through excel data
  for (let i = 0; i < fileData.length; i++) {
    let data = fileData[i];
    let record = {};
    let ip = data.split(' ');
    let lastNet;
    subnet = ip[ip.length - 1].split('.');
    lastNet = subnet[subnet.length - 1].replace(')', '');
    // console.log('subnet= ', subnet);
    // If last subnet digit is 0, start new iteration
    if (lastNet == 0) {
      isDiscovered = false;
    }
    // if ( presents means host name exist
    if (data.indexOf('(') > -1) {
      let hstName = ip[ip.length - 2];
      // Check if Jublcorp exist in hostname or not
      let matchHost = hstName.match(/jubl/gi);
      if (matchHost) {
        if (!isDiscovered) {
          let newsub = subnet;
          newsub[newsub.length - 1] = 0;
          record.Subnets = newsub.join('.').replace('(', '').replace(')', '');
          record.Status = 'Discovered';
        }
        record['Host IP'] = ip[ip.length - 1].substring(1, ip[ip.length - 1].length - 1);
        record['Host Names'] = ip[ip.length - 2];
        isDiscovered = true;
        excelData.push(record);
      }
    }
    if (lastNet == 255) {
      // Check for last record of ip
      let discData = {};
      subnet[subnet.length - 1] = 0;
      let sub = subnet.join('.').replace('(', '').replace(')', '');
      discData.Subnets = sub;
      // If nothing discovered for current subnet
      if (isDiscovered == false) {
        record.Subnets = sub;
        record.Status = 'Not Discovered';
        record['Host IP'] = 'NA';
        record['Host Names'] = 'NA';
        record.Remark = 'NA Discovered';
        discData.Status = 'Not Discovered';
        excelData.push(record);
      } else {
        discData.Status = 'Discovered';
      }
      // For network workbook
      netDisc.push(discData);
    }
  }
  // Create CSV files with 2 workbooks
  var wb = XLSX.utils.book_new();
  wb.SheetNames.push(workbook1);
  wb.SheetNames.push(workbook2);
  var netSheet = XLSX.utils.json_to_sheet(netDisc);
  var hostSheet = XLSX.utils.json_to_sheet(excelData);
  wb.Sheets[workbook1] = netSheet;
  wb.Sheets[workbook2] = hostSheet;
  var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  fs.writeFileSync(excelFileName, wbout, 'binary');
  console.log('Execution Succeed!!!');
});
