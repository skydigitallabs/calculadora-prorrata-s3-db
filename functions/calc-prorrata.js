'use strict';

const AWS =  require('aws-sdk');
const csvParser = require('csv-parser');

const { isValidItem } = require('../helpers/items');
const { createLogString, getLogName } = require('../helpers/logs');
const { queryAwsDynamoDb,
        putItemAwsDynamoDb,
        updateItemAwsDynamoDb,
        checkItemAwsDynamoDb,
      } = require('../helpers/aws/dynamodb');

module.exports = class CalcProrratS3toDb {

  constructor(context, event, callback) {
    this.event = context;
    this.event = event;
    this.callback = callback;

    AWS.config.update({region: process.env.REGION});
  }

  async run() {
    try {      

      if (this.event.Records) {
        const S3 = new AWS.S3();

        for(const record of this.event.Records) { // mudar para CONTEXT    
          const { s3 } = record;
          const s3params = { Bucket: s3.bucket.name, Key: s3.object.key };
          const s3Stream = S3.getObject(s3params).createReadStream()
          const csvArray = [];
          const errors = [];
          let dDbParams = {};
  
          s3Stream
            .pipe(csvParser({ separator: ';' }))
            .on('data', (data) => csvArray.push(JSON.parse(JSON.stringify(data))))
            .on('end', async () => {
              for(const row of csvArray) {
                // verify if a item is valid
                const validation = isValidItem(row);
  
                if (!validation.success) {
                  // item is not valid
                  for (const error of validation.errors) errors.push(error);
                  continue;
                }
  
                const query = {
                  TableName: process.env.CUSTOMERS_TABLE,
                  ExpressionAttributeValues: {
                    ':value': { S: row.CUSTOMER }
                  }, 
                  KeyConditionExpression: 'CUSTOMER = :value',
                }
  
                // check if the item exists
                const item = await queryAwsDynamoDb(query);
                
                if (!checkItemAwsDynamoDb(item)) {
                  dDbParams = {
                    TableName: process.env.CUSTOMERS_TABLE,
                    Item: { 
                      'CUSTOMER': { S: row.CUSTOMER },
                      'PACOTE_ANTIGO': { S: row.PACOTE_ANTIGO },
                      'VLR_ANTIGO': { S: row.VLR_ANTIGO },
                      'PRODUTO_NOVO': { S: row.PRODUTO_NOVO },
                      'VLR_NOVO': { S: row.VLR_NOVO },
                    },
                  }
                  await putItemAwsDynamoDb(dDbParams);
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
                  await updateItemAwsDynamoDb(dDbParams);
                }
              }
  
              // errors accours
              if (errors.length > 0) {
                // write csv file to S3
                const logErrorName = getLogName();
                const params = {
                  Bucket: process.env.LOG_BUCKET,
                  Key: logErrorName,
                  Body: createLogString(errors),
                };
                S3.putObject(params, (err, data) => {
                  if (err) {
                    console.log('Error in write log file in S3', `${err}: ${err.stack}`);
                  } else {
                    console.log(`Não foi possível importar todas as informarções do arquivo ${s3.object.key}. Verifique o log em ${logErrorName}`)
                  }
                });
              }
            });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}