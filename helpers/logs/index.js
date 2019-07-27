
const { LOG_FILE_HEADER } = require('../constants');

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
module.exports.getLogName = () => {
  return `${process.env.SERVICE}-${Date.now().toString()}-log.csv`;
}