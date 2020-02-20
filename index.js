const LaunchDarkly = require('ldclient-node');
const atob = require('atob');
const DynamoDBFeatureStore = require('launchdarkly-node-server-sdk-dynamodb');
const dynamoDBOptions = { region: process.env.DYNAMO_REGION, accessKeyId: process.env.DYNAMO_ACCESS_KEY, secretAccessKey: process.env.DYNAMO_SECRET_KEY};
const store = DynamoDBFeatureStore(process.env.DYNAMO_TABLE_NAME);
const config = {
    featureStore: store,
    useLdd: true
  };

let ldClient = null
let isReady = false

function evaluate(event, context, callback) {
  const flagKey = event.pathParameters.flag;
  const userBase64 = event.pathParameters.user;
  const userStr = atob(userBase64);
  const user = JSON.parse(userStr);

  if(!flagKey){
    ldClient.allFlagsState(user, function(err, allFlags) {
      ldClient.flush();
      callback(null, {"statusCode": 200, "body": JSON.stringify(allFlags)})
    })
  } else {
    ldClient.variation(flagKey, user, false, function(err, variation) {
      if (variation === undefined) throw('unknown variation')
      ldClient.flush();
      callback(null, {"statusCode": 200, "body": JSON.stringify(variation)})
    });
  }
}

exports.handler = function (event, context, callback) {
  if (!event.pathParameters.user) throw('missing user')
  
  context.callbackWaitsForEmptyEventLoop = false;
  
  if (!ldClient) {
    ldClient = LaunchDarkly.init(process.env.SDK_KEY, config);
  }
  if (!isReady) {
    ldClient.once(`ready`, function() {
      isReady = true
      evaluate(event, context, callback)
    })
  } else {
    evaluate(event, context, callback)
  }
};

