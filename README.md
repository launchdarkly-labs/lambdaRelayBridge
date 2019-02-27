# lambdaRelayBridge

LambdaRelayBridge is a reference implementation that is intended to be used for querying the LaunchDarkly relay proxy so you can get back the variant for a given user based on a feature flag that is passed in. The function assumes that you have confiured your relay proxy + SDK clients to be running in [daemon mode](https://docs.launchdarkly.com/docs/using-a-persistent-feature-store#section-using-a-persistent-feature-store-without-connecting-to-launchdarkly) and that you are using DynamoDB as the feature store. This is ideally suited for use cases where LaunchDarkly does not provide a native sdk (i.e. Roku), you can invoke the lambda function from you application. This will in effect turn your application into a simple http client, where each request will call the lambda function, which will in turn scan the database + evaluate the user and the variant for the user will be returned.

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
* With the newly created {user} selected, click on Actions and select Create Resrouce. Set the resource patht to {flag}
* With the newly created {flag} selected, click on Actions and select Create Method. Click on the dropdown and select GET
* Once the method has been created, be sure to select "Use Lambda Proxy Integration" and in the Lambda Function box, enter the name of the newly created lambda function

### Configuring the lambda function

* Clone the repo locally `git clone https://github.com/launchdarkly/lambdaRelayBridge.git`
* Select your Lambda function in the designer and under function code click on the dropdown for code entry type. Upload a .zip file and use the zip file downloaded from git
* Set the following environment variables
* * Key: DYNAMO_ACCESS_KEY || Value: *enter_access_key*
* * Key: DYNAMO_SECRET_KEY || Value: *enter_secret_key*
* * Key: DYNAMO_REGION || Value: *enter_dynamo_region*
* * Key: SDK_KEY || Value: *enter_ld_sdk_key*