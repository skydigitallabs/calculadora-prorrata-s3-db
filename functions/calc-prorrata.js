'use strict';

const AWS =  require('aws-sdk');
const csvParser = require('csv-parser');

function dDbPutItem(dDbParams) {
  const dDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  return new Promise((resolve, reject) => {
    dDb.putItem(dDbParams, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function dDbUpdateItem(dDbParams) {
  const dDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  return new Promise((resolve, reject) => {
    dDb.updateItem(dDbParams, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function queryAwsDynamoDb(query) {
  const dDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  return new Promise((resolve, reject) => {
    dDb.query(query, (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  })
}

function checkItemInDb(item) {
  return item.Count > 0;
}

module.exports = class CalcProrratS3toDb {

  constructor(context, event, callback) {
    this.context = context;
    this.event = event;
    this.callback = callback;

    AWS.config.update({region: process.env.REGION});
  }

  async run() {
    try {      

      const S3 = new AWS.S3();

      for(const record of this.event.Records) {
        
        const { s3 } = record;
        const s3params = { Bucket: s3.bucket.name, Key: s3.object.key };
        const s3Stream = S3.getObject(s3params).createReadStream()
        const csvArray = [];
        let dDbParams = {};

        s3Stream
          .pipe(csvParser({ separator: ';' }))
          .on('data', (data) => csvArray.push(JSON.parse(JSON.stringify(data))))
          .on('end', async () => {
            for(const row of csvArray) {
              const query = {
                TableName: process.env.CUSTOMERS_TABLE,
                ExpressionAttributeValues: {
                  ':value': { S: row.CUSTOMER }
                }, 
                KeyConditionExpression: 'CUSTOMER = :value',
              }

              const item = await queryAwsDynamoDb(query);
              
              if (!checkItemInDb(item)) {
                dDbParams = {
                  TableName: process.env.CUSTOMERS_TABLE,
                  Item: { 
                    'CUSTOMER': { S: row.CUSTOMER },
                    'PACOTE_ANTIGO': { S: row.PACOTE_ANTIGO },
                    'VLR_ANTIGO': { S: row.VLR_ANTIGO },
                    'PACOTE_NOVO': { S: row.PRODUTO_NOVO },
                    'VLR_NOVO': { S: row.VLR_NOVO },
                  },
                }
                await dDbPutItem(dDbParams);
              } else {
                dDbParams = {
                  TableName: process.env.CUSTOMERS_TABLE,
                  ExpressionAttributeNames: {
                    '#PCTANT': 'PACOTE_ANTIGO', 
                    '#VLRANT': 'VLR_ANTIGO',
                    '#PCTNOV': 'PRODUTO_NOVO',
                    '#VLRNOV': 'VLR_NOVO',

                  },
                  ExpressionAttributeValues: {
                    ':pctant': { S: row.PACOTE_ANTIGO },
                    ':vlrant': { S: row.VLR_ANTIGO },
                    ':pctnov': { S: row.PRODUTO_NOVO },
                    ':vlrnov': { S: row.VLR_NOVO },
                  }, 
                  Key: { 'CUSTOMER': { S: row.CUSTOMER } }, 
                  ReturnValues: 'ALL_NEW', 
                  UpdateExpression: 'SET #PCTANT = :pctant, #VLRANT = :vlrant, #PCTNOV = :pctnov, #VLRNOV = :vlrnov'
                }
                await dDbUpdateItem(dDbParams);
              }
            }
          });
      }
    } catch (error) {
      console.log(error);
    }
  }
}