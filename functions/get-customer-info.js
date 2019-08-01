const AWS =  require('aws-sdk');

const { queryAwsDynamoDb, checkItemAwsDynamoDb } = require('../helpers/aws/dynamodb');
const { responseData } = require('../helpers/http');

module.exports = class GetCustomerInfo {

  constructor(context, event, callback) {
    this.context = context;
    this.event = event;
    this.callback = callback;

    AWS.config.update({region: process.env.REGION});
  }

  async run() {

    if (this.event.source === 'serverless-plugin-warmup') {
      console.log('WarmUp - Lambda is warm!');
      return callback(null, 'Lambda is warm!');
    }

    try {
      const { customerId } = this.context.pathParameters;
      let result = {};

      if (customerId) {
        const query = {
          TableName: process.env.CUSTOMERS_TABLE,
          ExpressionAttributeValues: {
            ':value': { S: customerId }
          },
          KeyConditionExpression: 'CUSTOMER = :value',
        }

        const item = await queryAwsDynamoDb(query);

        if (checkItemAwsDynamoDb(item)) {
          // item found
          result = responseData(200, 'Cliente encontrado com sucesso', { customerData: item });
        } else {
          // item not found
          result = responseData(404, 'Cliente não encontrado', {});
        }

        return this.callback(null, result);
      }
    } catch (error) {
      const result = responseData(
        502, 
        'Erro ao requisitar dados do cliente.', 
        { error: `Error ${error} - ${error.stack}`, }
      );
      console.log(`error result: ${JSON.stringify(result)}`);
      return this.callback(null, result);
    }
  }
}