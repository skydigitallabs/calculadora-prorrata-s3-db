
const { LOG_FILE_HEADER } = require('../constants');

function getTimeStampString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Create a string to write in csv file
 * 
 * @param { Array } rows Array of row strings
 * @returns { string } Csv content
 */
module.exports.createLogString = rows => {
  let csvContent = `${LOG_FILE_HEADER.join(';')}\r\n`;

  rows.forEach(rowArray => {
    let row = rowArray.join(';');
    csvContent += `${row}\r\n`;
  }) 

  return csvContent;
}

/**
 * Get log name
 * 
 * @returns { string } Log name
 */
module.exports.getLogName = (importedFileName) => {
  return `${importedFileName}-${getTimeStampString()}-log.csv`;
}