# lambdaRelayBridge

LambdaRelayBridge is a reference implementation that is intended to guide you through setting up a lambda function using the Node.js sdk in [daemon mode](https://docs.launchdarkly.com/docs/using-a-persistent-feature-store#section-using-a-persistent-feature-store-without-connecting-to-launchdarkly), in conjunction with using [DynamoDB](https://docs.launchdarkly.com/docs/using-a-persistent-feature-store#section-using-dynamodb) as the feature store. This will walk you through setting up an endpoint, where you can make the following GET requests:

* {user} - Will return all flags for a given user (base64 encoded)
* {user}/{featureFlag} - This will take in a user (base64 encoded) + feature flag, and will return the resulting variant for the user. 

This is ideally suited for use cases where LaunchDarkly does not provide a native SDK (e.g. Flutter) -- you can invoke the lambda function from within your application and get the requested data.

## Setup 

### Requirements 

* [LaunchDarkly Relay Proxy](https://github.com/launchdarkly/ld-relay)
* [LaunchDarkly - DybamoDB Feature Store](https://docs.launchdarkly.com/docs/using-a-persistent-feature-store#section-using-dynamodb)
* [AWS Lambda](https://aws.amazon.com/lambda/)
* [AWS DynamoDB](https://aws.amazon.com/dynamodb/)
* [AWS IAM](https://aws.amazon.com/iam/)

### Creating the IAM role

* Open the AWS IAM console and select "Roles"
* Select "Create Role"
* Select the option "Lambda" and then click "Next: Permissions"
* Add the following permission policies:
* * AmazonDynamoDBReadOnlyAccess
* * AWSXrayWriteOnlyAccess
* * AmazonAPIGatewayPushToCloudWatchLogs
* * AmazonDMSCloudWatchLogsRole
* * AWSXrayWriteOnlyAccessAWSLambdaBasicExecutionRole
* Give the role a name and save it

### Creating the lambda function 

* In AWS Lambda, select "Create function", choosing the "Author from scratch" option
* Name your function and set "Runtime" to "Node.js 12.x"
* Expand the "Choose or create an execution role" options, select "Use an existing role", select the custom role you created in IAM from the "Existing role" dropdown options, and "Create function"

### Configuring the API Gateway

* In the Designer section of AWS Lambda, select "+ Add trigger"
* From the "Trigger configuration" dropdown, select "API Gateway" then from the "API" dropdown, select "Create a new API"
* Under "Choose a template", select "REST API"
* Select "AWS IAM", under the security section
* Expand "Additional settings" options, enter a name for the new API, and set the "Deployment stage" then click "Add"
* In the Designer section of AWS Lambda, click "API Gateway". The API will be added to the API Gateway section of AWS Lambda. Click the name of the API to configure it.
* Under Resources, "ANY" will be selected by default, click on "Actions" and select "Delete Method"
* While your API is selected, click on "Actions" button and select "Create Resource". Set the resource path to {user}
* Select the newly created {user} resource, click on "Actions" and select "Create Method". Click on the dropdown, select "GET", and click the checkmark
* Once the method has been created, select the Integration type as "Use Lambda Proxy Integration", check the box next to "Use Lambda Proxy integration", select the appropriate "Lambda Region", and enter the name of the newly created "Lambda Function" then click "Save"
* Select {user}, click on "Actions" and select "Create Resource". Set the resource path to {flag}
* With the newly created {flag} selected, click on "Actions" and select "Create Method". Click on the dropdown, select "GET", and click the checkmark
* Once the method has been created, select the Integration type as "Use Lambda Proxy Integration", check the box next to "Use Lambda Proxy integration", select the appropriate "Lambda Region", and enter the name of the newly created "Lambda Function" then click "Save"

### Configuring the lambda function

* Clone the repo locally `git clone https://github.com/launchdarkly/lambdaRelayBridge.git`
* Within the repo, use either npm or brew to install the dependies from the package.json file
* Within the repo, run the following command: `zip -r lambdaRelayBridge.zip *`
* In the AWS Lambda Designer of your lambda function, under "Code entry type" select "Upload a .zip file" from the dropdown menu
* Under "Function package", click "Upload", select the zip file you created, click "Open" then click "Save" (at the top right)
* Set the following environment variables
* * Key: DYNAMO_ACCESS_KEY || Value: *enter_access_key* -- note this is the same as the AWS_ACCESS_KEY_ID
* * Key: DYNAMO_SECRET_KEY || Value: *enter_secret_key* -- note this is the same as the AWS_SECRET_ACCESS_KEY
* * Key: DYNAMO_REGION || Value: *enter_dynamo_region*
* * Key: DYNAMO_TABLE_NAME || Value: *enter_dynamo_ld_table_name*
* * Key: SDK_KEY || Value: *enter_ld_sdk_key*

### Deploying the API

* In the API Gateway console, select your API --> Actions --> Deploy API --> Select appropriate stage
* Once deployed, you can test out the API with the following command: `curl -i {api_endpoint}/{user}/{flag}`
* * {api_endpoint} = Url for your API endpoint -- you can find this in the API Gateway under Stages as the "Invoke URL"
* * {user} = User to be evaluated (base64 encoded) -- note that this is the full user object/request context and not just the key value itself, e.g. {"key":"abc123"}, which is then base64 encoded
* * {flag} = Feature flag to be evaluated
