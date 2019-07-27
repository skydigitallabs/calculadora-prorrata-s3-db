const AWS =  require('aws-sdk');

/**
 * Promise to query in DynamoDb
 * 
 * @param { string } query DynamoDb Query string
 * @returns { Promise<QueryResult> } Promise for the requested query
 */
module.exports.queryAwsDynamoDb = query => {
  const dDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  return new Promise((resolve, reject) => {
    dDb.query(query, (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  })
}

/**
 * Put items in Dynamo Db
 * 
 * @param { Object } dDbParams Parameter to put item in DynamoDb
 * 
 * @returns { Promise<PutitemResult> } Promise for the requested put item
 */
module.exports.putItemAwsDynamoDb = dDbParams => {
  const dDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  return new Promise((resolve, reject) => {
    dDb.putItem(dDbParams, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

/**
 * Update item in Dynamo Db
 * 
 * @param { Object } dDbParams Parameter to update item in DynamoDb
 * 
 * @returns { Promise<UpdateitemResult> } Promise for the requested updateItem item
 */
module.exports.updateItemAwsDynamoDb = dDbParams => {
  const dDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  return new Promise((resolve, reject) => {
    dDb.updateItem(dDbParams, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

/**
 * Verify if a item exists
 *
 * @param { Object } dDbParams Parameter to update item in DynamoDb
 * @returns { boolean } True if the item exists
 */
module.exports.checkItemAwsDynamoDb = items => {
  return items.Count > 0;
}