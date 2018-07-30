const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const Environment = require('./../environment.js');
const ApplicationException = require('./../model/applicationException.js');
const AdvanStationUtils = require('./../utility/advanceStationUtils.js');
const jwt = require('jsonwebtoken');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });
const environment = new Environment(Environment.APP_STATUS);
const advanStationUtils = new AdvanStationUtils();

function CognitoService() {
    this.userPool = new AmazonCognitoIdentity.CognitoUserPool({
        UserPoolId: environment.user_pool_id, // your user pool id here
        ClientId: environment.client_id, // your app client id here
    });
}
// convert to attribute email object
CognitoService.prototype.getCognitoUserAttributeObject = function(name, value) {
    return {
        Name: name,
        Value: value
    }
};
// get authenticationData
CognitoService.prototype.getAuthenticationData = function(username, password) {
    return {
        Username: username,
        Password: password
    };
};
// get authenticationDetails
CognitoService.prototype.getAuthenticationDetails = function(authenticationData) {
    return new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
};
// getCognitoUser
CognitoService.prototype.getCognitoUser = function(username) {
    var userData = {
        Username: username,
        Pool: this.userPool
    };
    return new AmazonCognitoIdentity.CognitoUser(userData);
};
// user signUp
CognitoService.prototype.signup = function(username, password, attributeList) {
    return new Promise((resolve, reject) => {
        this.userPool.signUp(username, password, attributeList, null, function(err, result) {
            console.log('[DEBUG] signup: ' + JSON.stringify(reuslt));
            if (advanStationUtils.isNotBlank(result)) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    })
};
// user confirm signUp
CognitoService.prototype.confirmSignUp = function(cognitoUser, verificationCode) {
    return new Promise((resolve, reject) => {
        cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
            console.log('[DEBUG] confirmRegistration done, result: ' + result);
            if (advanStationUtils.isBlank(result)) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
};
// user rqeuest resend verificatoin sms
CognitoService.prototype.resendVerificationCode = function(cognitoUser) {
    return new Promise((resolve, reject) => {
        cognitoUser.resendConfirmationCode(function(err, result) {
            if (advanStationUtils.isNotBlank(result)) {
                console.log('[DEBUG] resendVerificationCode done');
                resolve(result);
            } else {
                reject(err)
            }
        });
    })
};
// user Login
CognitoService.prototype.login = function(cognitoUser, authenticationDetails) {
    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                // var accessToken = result.getAccessToken().getJwtToken();
                // console.log("accessToken: " + accessToken);
                resolve(result);
            },
            onFailure: function(err) {
                console.log('Failed to login');
                reject(err);
            }
        });
    });
};
// user get cognito user
CognitoService.prototype.getCognitoUserByToken = function(accessToken) {
    return new Promise((resolve, reject) => {
        var params = {
            AccessToken: accessToken
        };
        cognitoidentityserviceprovider.getUser(params, function(err, result) {
            if (advanStationUtils.isNotBlank(result)) {
                resolve(result);
            } else {
                reject(err);
            }
        });
    });
};
// user update
CognitoService.prototype.updateUser = function(accessToken, attributeList) {
    return new Promise((resolve, reject) => {
        var params = {
            AccessToken: accessToken,
            UserAttributes: attributeList
        };
        cognitoidentityserviceprovider.updateUserAttributes(params, function(err, data) {
            if (advanStationUtils.isBlank(err)) {
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
};
// user attributes
CognitoService.prototype.getUserAttributes = function(cognitoUser) {
    return new Promise((resolve, reject) => {
        cognitoUser.getUserAttributes(function(err, result) {
            if (advanStationUtils.isNotBlank(result)) {
                resolve(result)
            } else {
                reject(err);
            }
        });
    });
};
// user forget password
CognitoService.prototype.forgotPassword = function(cognitoUser) {
    return new Promise((resolve, reject) => {
        cognitoUser.forgotPassword({
            onSuccess: function(result) {
                if (advanStationUtils.isNotBlank(result)) {
                    resolve(result);
                } else {
                    reject(ApplicationException.ERROR_CODE_USER_NOT_AUTH);
                }
            },
            onFailure: function(err) {
                if (advanStationUtils.isNotBlank(err)) {
                    reject(err);
                } else {
                    reject(ApplicationException.ERROR_UNKNOW);
                }
            }
        });
    });
};
// user confirm new password 
CognitoService.prototype.confirmNewPassword = function(cognitoUser, verificationCode, newPassword) {
    return new Promise((resolve, reject) => {
        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess() {
                resolve();
            },
            onFailure(err) {
                if (advanStationUtils.isNotBlank(err)) {
                    reject(err);
                } else {
                    reject(ApplicationException.ERROR_UNKNOW);
                }
            }
        });
    });
};
// user change password
CognitoService.prototype.changePassword = function(cognitoUser, oldPassword, newPassword) {
    return new Promise((resolve, reject) => {
        cognitoUser.changePassword(oldPassword, newPassword, function(err, result) {
            if (advanStationUtils.isNotBlank(result)) {
                resolve(result);
            } else {
                reject(err)
            }
        });
    });
};
// user signOut
CognitoService.prototype.signOut = function(cognitoUser) {
    return new Promise((resolve, reject) => {
        try {
            cognitoUser.signOut();
            resolve();
        } catch (err) {
            if (advanStationUtils.isNotBlank(err)) {
                reject(err);
            } else {
                reject();
            }
        }
    });
};
// user global signOut
CognitoService.prototype.globalSignOut = function(accessToken) {
    return new Promise((resolve, reject) => {
        var params = {
            AccessToken: accessToken
        };
        cognitoidentityserviceprovider.globalSignOut(params, function(err, data) {
            if (advanStationUtils.isBlank(err)) {
                resolve(data);
            } else {
                reject(err);
            }
        });
    });
};
// check user token alive
CognitoService.prototype.isTokenAlive = function(accessToken) {
    var result = false;
    var token = jwt.decode(accessToken, { complete: true });;
    var expireTime = Number.parseInt(token.payload.exp) * 1000;
    var now = new Date().getTime();

    console.log('[DEBUG] token obj: ' + JSON.stringify(token));
    console.log('[DEBUG] new: ' + now + ' expireTime: ' + expireTime);

    if (now < expireTime) {
        result = true;
    } else {
        result = false;
    }

    return result;
};
// verifiy user username is register
CognitoService.prototype.verifyUsername = function(username) {
    var defaultPassword = 'TESTING_PASSWORD';
    var cognitoUser;
    advanStationUtils.isNotBlank(username);
    cognitoUser = this.getCognitoUser(username);
    authenticationDetails = this.getAuthenticationDetails(this.getAuthenticationData(username, defaultPassword));
    return new Promise((resolve, reject) => {
        this.login(cognitoUser, authenticationDetails).then(result => {
            reject(result);
        }).catch(err => {
            resolve(err);
        });
    });
};
module.exports = CognitoService;