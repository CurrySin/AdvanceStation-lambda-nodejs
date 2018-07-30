const AWS = require('aws-sdk');
const Environment = require('./../environment.js');
const ApplicationException = require('./../model/applicationException.js');
const AdvanStationUtils = require('./../utility/advanceStationUtils.js');
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
const environment = new Environment(Environment.APP_STATUS);
const advanStationUtils = new AdvanStationUtils();

function DynamicDBService() {

}
// db put
DynamicDBService.prototype.put = function(params) {
    return new Promise((resolve, reject) => {
        console.log('[DEBUG] DynamicDBService putItem started');
        dynamodb.putItem(params, function(err, result) {
            console.log('[DEBUG] result: ' + JSON.stringify(result));
            console.log('[DEBUG] err: ' + JSON.stringify(err));
            if (advanStationUtils.isBlank(result)) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
};
// db get
DynamicDBService.prototype.get = function(params) {
    return new Promise((resolve, reject) => {
        console.log('[DEBUG] DynamicDBService getItem started');
        dynamodb.getItem(params, function(err, result) {
            console.log('[DEBUG] result: ' + JSON.stringify(result));
            console.log('[DEBUG] err: ' + JSON.stringify(err));
            if (advanStationUtils.isNotBlank(result)) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
};

module.exports = DynamicDBService;