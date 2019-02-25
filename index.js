var LaunchDarkly = require('ldclient-node');
//var redis = require('redis')

exports.handler = (event, context, callback) => {
    
    const flagKey = event.pathParameters.flag;
    const userBase64 = event.pathParameters.user;
    const userStr = atob(userBase64);
    const user = JSON.parse(userStr);

    //configure dynamoDB client


    // use ldd to connect to relay proxy


    console.log("initialization")
    ldclient = LaunchDarkly.init("sdk-8929dfb7-7edd-4bec-9856-db3bd80a6661", {
        //feature_store: new LaunchDarkly.RedisFeatureStore(redisConfig),
        //use_ldd: true
    });
    console.log("user")
    
    console.log("once")
    ldclient.once('ready', () => {
        console.log("ready")
        ldclient.variation(flagKey, user, false, callback);
    });
};