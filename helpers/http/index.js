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
      'Access-Controll-Allow-Origin': '*',
      'Access-Controll-Allow-Credentials': true,
    },
    statusCode: statusCode,
    body: JSON.stringify(bodyObj),
  };
}