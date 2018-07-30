const Environment = require('./../environment.js');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const ApplicationException = require('./../model/applicationException.js');
const AdvanStationUtils = require('./../utility/advanceStationUtils.js');
const CognitoService = require('./../service/cogitoService.js');

const environment = new Environment(Environment.APP_STATUS);
const advanStationUtils = new AdvanStationUtils();
const cognitoService = new CognitoService();

function UserHandler() {};

UserHandler.REQUEST_TYPE_CODE = 'user';

UserHandler.prototype.handleRequest = function(requestFunction, event, callback) {
        console.log('[DEBUG] user handler requestFunction: ' + requestFunction);
        if (advanStationUtils.isNotBlank(requestFunction)) {
            switch (requestFunction) {
                case 'signUP':
                    this.signUpUser(event, callback);
                    break;
                case 'confirmUser':
                    this.confirmSignUp(event, callback);
                    break;
                case 'reSendVerificationCode':
                    this.reSendVerificationCode(event, callback);
                    break;
                case 'login':
                    this.login(event, callback);
                    break
                case 'userUpdate':
                    this.userUpdate(event, callback);
                    break;
                case 'getUserAttribute':
                    this.getUserAttribute(event, callback);
                    break;
                case 'changePassword':
                    this.changePassword(event, callback);
                    break;
                case 'forgotPassword':
                    this.requestForgotPassword(event, callback);
                    break;
                case 'confirmNewPassword':
                    this.confirmNewPassword(event, callback);
                    break;
                case 'signOut':
                    this.signOut(event, callback);
                    break;
                case 'globalSignOut':
                    this.globalSignOut(event, callback);
                    break;
                default:
                    throw new ApplicationException(ApplicationException.ERROR_CODE_INVAILD_REQUEST_FUNCTION, callback);
            }
        } else {
            throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
        }
    }
    // user sign up
UserHandler.prototype.signUpUser = function(event, callback) {
    console.log('[DEBUG] signUp user')
    var attributeList = [];
    if (advanStationUtils.isNotBlank(event.email) && advanStationUtils.isNotBlank(event.mobilePhone) && advanStationUtils.isNotBlank(event.licensePlate)) {
        var dataEmail = cognitoService.getCognitoUserAttributeObject(Environment.ATTRIBUTE_PARAM_EMAIL, event.email);
        var dataPhoneNumber = cognitoService.getCognitoUserAttributeObject(Environment.ATTRIBUTE_PARAM_MOBILE, event.mobilePhone);
        var dataLicensePlate = cognitoService.getCognitoUserAttributeObject(Environment.ATTRIBUTE_PARAM_LICENSE_PLATE, event.licensePlate);
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);
        var attributeLicensePlate = new AmazonCognitoIdentity.CognitoUserAttribute(dataLicensePlate);
        attributeList.push(attributeEmail);
        attributeList.push(attributePhoneNumber);
        attributeList.push(attributeLicensePlate);
        cognitoService.signup(event.username, event.password, attributeList).then((result) => {
            if (advanStationUtils.isNotBlank(result)) {
                callbackWaitsForEmptyEventLoop = false;
                callback(null, result);
            } else {
                throw new ApplicationException(ApplicationException.ERROR_CODE_USER_CANT_SUGNUP, callback);
            }
        }).catch((err) => {
            throw new ApplicationException(ApplicationException.ERROR_CODE_USER_CANT_SUGNUP, callback, err);
        });
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// confirm sign up
UserHandler.prototype.confirmSignUp = function(event, callback) {
    console.log('[DEUBG] confirm Sign Up');
    var cognitoUser;
    if (advanStationUtils.isNotBlank(event.username) && advanStationUtils.isNotBlank(event.password) && advanStationUtils.isNotBlank(event.verificationCode)) {
        cognitoUser = cognitoService.getCognitoUser(event.username);
        cognitoService.confirmSignUp(cognitoUser, event.verificationCode).then((result) => {
            if (advanStationUtils.isBlank(result)) {
                callbackWaitsForEmptyEventLoop = false;
                callback(null, result);
            } else {
                throw new ApplicationException(ApplicationException.ERROR_CODE_USER_NOT_AUTH, callback);
            }
        }).catch((err) => {
            throw new ApplicationException(ApplicationException.ERROR_CODE_USER_NOT_AUTH, callback, err);
        });
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user request resend verificaiton code
UserHandler.prototype.reSendVerificationCode = function(event, callback) {
    console.log('[DEBUG] resend verification cdoe, username: ' + event.username);
    var cognitoUser;
    if (advanStationUtils.isNotBlank(event.username) && advanStationUtils.isNotBlank(event.password)) {
        cognitoUser = cognitoService.getCognitoUser(event.username);
        cognitoService.resendVerificationCode(cognitoUser).then((result) => {
            if (advanStationUtils.isNotBlank(result)) {
                callbackWaitsForEmptyEventLoop = false;
                callback(null, result);
            } else {
                throw new ApplicationException(ApplicationException.ERROR_CODE_USER_NOT_AUTH, callback);
            }
        }).catch((err) => {
            throw new ApplicationException(err, callback);
        })
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user login
UserHandler.prototype.login = function(event, callback) {
    console.log('[ DEBUBG ] Login');
    var cognitoUser;
    var authenticationDetails;
    if (advanStationUtils.isNotBlank(event.username) && advanStationUtils.isNotBlank(event.password)) {
        cognitoUser = cognitoService.getCognitoUser(event.username);
        if (advanStationUtils.isNotBlank(cognitoUser)) {
            authenticationDetails = cognitoService.getAuthenticationDetails(cognitoService.getAuthenticationData(event.username, event.password));
            cognitoService.login(cognitoUser, authenticationDetails).then(((token) => {
                if (advanStationUtils.isNotBlank(token)) {
                    callbackWaitsForEmptyEventLoop = false;
                    callback(null, token);
                } else {
                    throw new ApplicationException(ApplicationException.ERROR_CODE_USER_NOT_AUTH, callback);
                }
            })).catch((err) => {
                throw new ApplicationException(err, callback);
            });
        } else {
            throw new ApplicationException(ApplicationException.ERROR_CODE_USER_NOT_FOUND, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user update
UserHandler.prototype.userUpdate = function(event, callback) {
    console.log('[DEBUG] User Update');
    var attributeList = [];
    if (advanStationUtils.isNotBlank(event.accessToken) && advanStationUtils.isNotBlank(event.email)) {
        var dataEmail = cognitoService.getCognitoUserAttributeObject(Environment.ATTRIBUTE_PARAM_EMAIL, event.email);
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        attributeList.push(attributeEmail);
        cognitoService.updateUser(event.accessToken, attributeList).then((result) => {
            callbackWaitsForEmptyEventLoop = false;
            callback(null, result);
        }).catch((err) => {
            console.log(err);
            throw new ApplicationException(err, callback);
        });
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user attribute
UserHandler.prototype.getUserAttribute = function(event, callback) {
    console.log('[DEBUG] Get User Attribute');
    if (advanStationUtils.isNotBlank(event.accessToken)) {
        cognitoService.getCognitoUserByToken(event.accessToken).then((result) => {
            callbackWaitsForEmptyEventLoop = false;
            callback(null, result);
        }).catch((err) => {
            console.log(err);
            throw new ApplicationException(err, callback);
        });
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user chagne password
UserHandler.prototype.changePassword = function(event, callback) {
    console.log('[DEBUG] Change Password');
    var cognitoUser;
    if (advanStationUtils.isNotBlank(event.username) && advanStationUtils.isNotBlank(event.oldPassword) && advanStationUtils.isNotBlank(event.newPassword)) {
        cognitoUser = cognitoService.getCognitoUser(event.username);
        if (advanStationUtils.isNotBlank(cognitoUser)) {
            cognitoService.changePassword(cognitoUser, event.oldPassword, event.newPassword).then((result) => {
                callbackWaitsForEmptyEventLoop = false;
                callback(null, result);
            }).catch((err) => {
                console.log(err);
                throw new ApplicationException(err, callback);
            });
        } else {
            throw new ApplicationException(ApplicationException.ERROR_CODE_USER_IS_NOT_AUTH, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user request forgot password
UserHandler.prototype.requestForgotPassword = function(event, callback) {
    console.log('[DEBUG] Request Forgot Password');
    var cognitoUser;
    if (advanStationUtils.isNotBlank(event.username)) {
        cognitoUser = cognitoService.getCognitoUser(event.username);
        if (advanStationUtils.isNotBlank(cognitoUser)) {
            cognitoService.forgetPassword(cognitoUser).then((result) => {
                callbackWaitsForEmptyEventLoop = false;
                callback(null, result);
            }).catch((err) => {
                throw new ApplicationException(ApplicationException.ERROR_CODE_USER_IS_NOT_AUTH);
            });
        } else {
            throw new ApplicationException(ApplicationException.ERROR_CODE_USER_NOT_AUTH, callback)
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user confirm new password
UserHandler.prototype.confirmNewPassword = function(event, callback) {
    console.log('[DEBUG] Confirm New Password');
    var cognitoUser;
    if (advanStationUtils.isNotBlank(event.username) && advanStationUtils.isNotBlank(event.verificationCode) && advanStationUtils.isNotBlank(event.newPassword)) {
        cognitoUser = cognitoService.getCognitoUser(event.username);
        if (advanStationUtils.isNotBlank(cognitoUser)) {
            cognitoService.confirmNewPassword(cognitoUser, event.verificationCode, event.newPassword).then((result) => {
                console.log(result);
                callbackWaitsForEmptyEventLoop = false;
                callback(null, result);
            }).catch((err) => {
                throw new ApplicationException(err, callback);
            });
        } else {
            throw new ApplicationException(ApplicationException.ERROR_CODE_USER_IS_NOT_AUTH, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user sign out
UserHandler.prototype.signOut = function(event, callback) {
    console.log('[DEBUG] Sign Out');
    var cognitoUser;
    if (advanStationUtils.isNotBlank(event.username)) {
        cognitoUser = cognitoService.getCognitoUser(event.username);
        if (advanStationUtils.isNotBlank(cognitoUser)) {
            cognitoService.signOut(cognitoUser).then((result) => {
                console.log('[DEBUG] resultL: ' + result);
                callbackWaitsForEmptyEventLoop = false;
                callback(null, result);
            }).catch((err) => {
                throw new ApplicationException(err, callback);
            });
        } else {
            throw new ApplicationException(ApplicationException.ERROR_CODE_USER_NOT_AUTH, callback);
        }
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
// user global sign out
UserHandler.prototype.globalSignOut = function(event, callback) {
    console.log('[DEBUG] Global SignOut');
    if (advanStationUtils.isNotBlank(event.accessToken)) {
        cognitoService.globalSignOut(event.accessToken).then((result) => {
            callbackWaitsForEmptyEventLoop = false;
            callback(null, result);
        }).catch((err) => {
            console.log(err);
            throw new ApplicationException(err, callback);
        })
    } else {
        throw new ApplicationException(ApplicationException.ERROR_CODE_NO_INPUT_DATA, callback);
    }
};
module.exports = UserHandler;