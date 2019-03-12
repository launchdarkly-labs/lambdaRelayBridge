# lambdaRelayBridge

LambdaRelayBridge is a reference implementation that is intended to guide you through setting up a lambda function using the Node.js sdk in [daemon mode](https://docs.launchdarkly.com/docs/using-a-persistent-feature-store#section-using-a-persistent-feature-store-without-connecting-to-launchdarkly), in conjunction with using [DynamoDB](https://docs.launchdarkly.com/docs/using-a-persistent-feature-store#section-using-dynamodb) as the feature store. This will walk you through setting up an endpoint, where you can make the following GET requests:

* {user} - Will return all flags for a given user (base64 encoded)
* {user}/{featureFlag} - This will take in a user (base64 encoded) + feature flag, and will return the resulting variant for the user. 

This is ideally suited for use cases where LaunchDarkly does not provide a native sdk (i.e. Roku), you can invoke the lambda function from within your application, and get the requested data.

## Setup 

### Requirements 

* [LaunchDarkly Relay Proxy](https://github.com/launchdarkly/ld-relay)
* [LaunchDarkly - DybamoDB Feature Store](https://docs.launchdarkly.com/docs/using-a-persistent-feature-store#section-using-dynamodb)
* [AWS Lambda](https://aws.amazon.com/lambda/)
* [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
* [AWS IAM](https://aws.amazon.com/iam/)

### Creating the IAM role

* Open the AWS IAM console and select roles
* Select Create Role
* Select the option lambda and then click "Next: Permissions"
* Add the following permission policies:
* * AmazonDynamoDBReadOnlyAccess
* * AWSXrayWriteOnlyAccess
* * AmazonAPIGatewayPushToCloudWatchLogs
* * AmazonDMSCloudWatchLogsRole
* * AWSXrayWriteOnlyAccessAWSLambdaBasicExecutionRole
* Give the role a name and save it

### Creating the lambda function 

* In AWS Lambda, create a new function, selecting "Author from scratch"
* Set "Runtime" to "Node.js 8.10"
* In the dropdown for Role, choose existing role, select the custom role you created and create function

### Configuring the API Gateway

* In the Designer, select API gateway
* There will be a new section titled "Configured triggers", click on the API dropdown and select "Create a new API"
* Select "AWS IAM", under the security section
* "ANY" will be selected by default, click on Actions and select on "Delete Method"
* While your API is selected, click on Actions and select Create Resource. Set the resource path to {user}
* Select the newly created {user} resource, click on Actions and select Create Method. Click on the dropdown and select GET
* Once the method has been created, be sure to select "Use Lambda Proxy Integration" and in the Lambda Function box, enter the name of the newly created lambda function
* Select {user}, click on Actions and select Create Resrouce. Set the resource path to {flag}
* With the newly created {flag} selected, click on Actions and select Create Method. Click on the dropdown and select GET
* Once the method has been created, be sure to select "Use Lambda Proxy Integration" and in the Lambda Function box, enter the name of the newly created lambda function

### Configuring the lambda function

* Clone the repo locally `git clone https://github.com/launchdarkly/lambdaRelayBridge.git`
* Within the repo, run the following command: `zip -r lambdaRelayBridge.zip *`
* In AWS, select your Lambda function in the designer and under function code click on the dropdown for code entry type. Upload a .zip file and use the zip file you created
* Set the following environment variables
* * Key: DYNAMO_ACCESS_KEY || Value: *enter_access_key*
* * Key: DYNAMO_SECRET_KEY || Value: *enter_secret_key*
* * Key: DYNAMO_REGION || Value: *enter_dynamo_region*
* * Key: DYNAMO_TABLE_NAME || Value: *enter_dynamo_ld_table_name*
* * Key: DYNAMO_LD_PREFIX || Value: *enter_dynamo_ld_prefix*

### Deploying the API

* In the API Gateway console, select your API --> Actions --> Deploy API --> Select appropriate stage
* Once deployed, you can test out the API with the following command: `curl -i {api_endpoint}\{flag}\{user}`
* * {api_endpoint} = Url for your API endpoint
* * {flag} = Feature flag to be evaluated
* * {user} = User to be evaluated (base64 encoded)