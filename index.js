const AWS = require('aws-sdk');
global.fetch = require('node-fetch')
const Environment = require('./environment.js');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const ApplicationException = require('./model/applicationException.js');
const AdvanStationUtils = require('./utility/advanceStationUtils');
const UserHandler = require('./handler/userHandler.js');
const ServiceHandler = require('./handler/servicesHandler.js');

const environment = new Environment(Environment.APP_STATUS);
const advanStationUtils = new AdvanStationUtils();
const userHandler = new UserHandler();
const serviceHandler = new ServiceHandler();
AWS.config.update({ region: environment.region });


exports.handler = function(event, context, callback) {
    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = environment.region; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: environment.identity_pool_id,
    });

    if (advanStationUtils.isNotBlank(event)) {
        console.log('[DEBUG] requestType: ' + event.requestType);
        console.log('[DEBUG] requestFunction ' + event.requestFunction);
        if (advanStationUtils.isNotBlank(event.requestType)) {
            switch (event.requestType) {
                case UserHandler.REQUEST_TYPE_CODE:
                    userHandler.handleRequest(event.requestFunction, event, callback);
                    break;
                case ServiceHandler.REQUEST_TYPE_CODE:
                    serviceHandler.handleRequest(event.requestFunction, event, callback);
                    break;
                default:
                    throw new ApplicationException(ApplicationException.ERROR_CODE_INVAILD_REQUEST_TYPE, callback);
            }
        } else {
            throw new ApplicationException(ApplicationException.ERROR_CODE_INVAILD_REQUEST_TYPE, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};