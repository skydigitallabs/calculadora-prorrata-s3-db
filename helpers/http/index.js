/**
 * Build response object
 * 
 * @param { number } statusCode
 * @param { string } message
 * @param { Object } data
 * @returns { Object }
 */
module.exports.responseData = (statusCode, message, data) => {
  const bodyObj = {
    message: message,
    data: data,
  };
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
    statusCode: statusCode,
    body: JSON.stringify(bodyObj),
  };
}