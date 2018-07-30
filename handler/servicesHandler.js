const Environment = require('./../environment.js');
const ApplicationException = require('./../model/applicationException.js');
const AdvanStationUtils = require('./../utility/advanceStationUtils.js');
const DynamoDBService = require('./../service/dynamoDBService.js');
const CognitoService = require('./../service/cogitoService.js');
const jwt = require('jsonwebtoken');

const environment = new Environment(Environment.APP_STATUS);
const advanStationUtils = new AdvanStationUtils();
const dynamoDBService = new DynamoDBService();
const cognitoService = new CognitoService();

function ServiceHandler() {};

ServiceHandler.REQUEST_TYPE_CODE = 'service';

ServiceHandler.prototype.handleRequest = function(requestFunction, event, callback) {
    console.log('[DEBUG] service handler requestFunction: ' + requestFunction);
    if (advanStationUtils.isNotBlank(requestFunction)) {
        switch (requestFunction) {
            case 'serviceCreate':
                this.createService(event, callback);
                break;
            case 'getService':
                this.getService(event, callback);
                break;
            case 'getAllServices':
                // get all services
                break;
            case 'updateService':
                // update a service;
                break;
            case 'deleteService':
                // delete a service
                break;
            default:
                throw new ApplicationException(ApplicationException.ERROR_CODE_INVAILD_REQUEST_FUNCTION, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};

ServiceHandler.prototype.createService = function(event, callback) {
    console.log('[DEUBG] create service');
    if (
        advanStationUtils.isNotBlank(event.serviceName) &&
        advanStationUtils.isNotBlank(event.desc) &&
        advanStationUtils.isNotBlank(event.price) &&
        advanStationUtils.isNotBlank(event.accessToken)
    ) {
        var params = {
            TableName: environment.db_table_service
        };
        params.Item = {
            "serviceName": {
                S: event.serviceName
            },
            "desc": {
                S: event.desc
            },
            "price": {
                N: event.price.toString()
            },
            "active": {
                BOOL: true
            }
        }

        console.log('[DEBUG] params: ' + JSON.stringify(params));
        if (cognitoService.isTokenAlive(event.accessToken)) {
            dynamoDBService.put(params).then((result) => {
                if (advanStationUtils.isBlank(result)) {
                    callbackWaitsForEmptyEventLoop = false;
                    callback(null, result);
                } else {
                    throw new ApplicationException(ApplicationException.ERROR_UNKNOW, callback);
                }
            }).catch((err) => {
                throw new ApplicationException(err, callback);
            });
        } else {
            throw new ApplicationException(ApplicationException.ERROR_TOKEN_EXPIRE, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};

ServiceHandler.prototype.getService = function(event, callback) {
    console.log('[DEBUG] get service');
    if (
        advanStationUtils.isNotBlank(event.serviceName) &&
        advanStationUtils.isNotBlank(event.accessToken)
    ) {
        var params = {
            TableName: environment.db_table_service
        };
        params.Key = {
            "serviceName": {
                S: event.serviceName
            }
        }
        if (cognitoService.isTokenAlive(event.accessToken)) {
            dynamoDBService.get(params).then((result) => {
                if (advanStationUtils.isNotBlank(result)) {
                    var service = {};
                    service.active = advanStationUtils.getItemValueByItem(result.Item, 'active', 'BOOL');
                    service.serviceName = advanStationUtils.getItemValueByItem(result.Item, 'serviceName', 'S');
                    service.price = advanStationUtils.getItemValueByItem(result.Item, 'price', 'N');
                    service.desc = advanStationUtils.getItemValueByItem(result.Item, 'desc', 'S');
                    callbackWaitsForEmptyEventLoop = false;
                    callback(null, result);
                } else {
                    throw new ApplicationException(ApplicationException.ERROR_UNKNOW, callback);
                }
            }).catch((err) => {
                throw new ApplicationException(err, callback, err);
            });
        } else {
            throw new ApplicationException(ApplicationException.ERROR_TOKEN_EXPIRE, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};

module.exports = ServiceHandler;