const LaunchDarkly = require('ldclient-node');
const atob = require('atob');
const DynamoDBFeatureStore = require('ldclient-node-dynamodb-store');
const dynamoDBOptions = { region: process.env.DYNAMO_REGION, accessKeyId: process.env.DYNAMO_ACCESS_KEY, secretAccessKey: process.env.DYNAMO_SECRET_KEY};
const store = DynamoDBFeatureStore('ld-relay', { clientOptions: dynamoDBOptions, prefix:"ld:manuel_demo:production" });
const config = {
    featureStore: store,
    useLdd: true
  };

let ldClient = null
let isReady = false

function evaluate(event, context, callback) {
  const flagKey = event.pathParameters.flag || "undefined";
  const userBase64 = event.pathParameters.user;
  const userStr = atob(userBase64);
  const user = JSON.parse(userStr);
  console.log("once ready called");

  ldClient.variation(flagKey, user, false, function(err, variation) {
    console.log("variation being performed");
    if (variation === undefined) throw('unknown variation')
    console.log("here is my variation: " + variation);
    ldClient.flush();
    callback(null, {"statusCode": 200, "body": JSON.stringify(variation)})
    //callback(null, variation)
  });
}

exports.handler = function (event, context, callback) {
  if (!event.pathParameters.flag) throw('missing flag')
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

