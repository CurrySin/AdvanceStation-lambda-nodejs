const AdvanceStationUtils = require('./../utility/advanceStationUtils.js');
const advanceStationUtils = new AdvanceStationUtils();

function ApplicationException(errorMessage, callback) {
    console.log('errorMessage: ' + JSON.stringify(errorMessage));
    callback(JSON.stringify(errorMessage));
}

// function ApplicationException(errorMessage, callback, error) {
//     var errorString = [];
//     console.log('errorMessage: ' + JSON.stringify(errorMessage));
//     console.log('error: ' + JSON.stringify(error));
//     console.log(error)
//     if (advanceStationUtils.isNotBlank(errorMessage)) {
//         errorString.push(errorMessage);
//     }
//     if (advanceStationUtils.isNotBlank(error)) {
//         errorString.push(JSON.stringify(error));
//     }
//     callback(JSON.stringify(error));
// }

ApplicationException.ERROR_CODE_INVAILD_REQUEST_TYPE = 'invaild request type.';
ApplicationException.ERROR_CODE_INVAILD_REQUEST_FUNCTION = 'invaild request function';
ApplicationException.ERROR_CODE_NO_INPUT_DATA = 'input parameter missed.';
ApplicationException.ERROR_CODE_USER_NOT_FOUND = 'user not found.';
ApplicationException.ERROR_CODE_USER_NOT_AUTH = 'user auth failed.';
ApplicationException.ERROR_CODE_USER_CANT_SUGNUP = 'user cant sign up since some error.';
ApplicationException.ERROR_CODE_ENV_WRONG_IPUT = 'input wrong environemnt status code (dev/prod).'
ApplicationException.ERROR_CODE_USER_IS_NOT_AUTH = 'User is not authenticated';
ApplicationException.ERROR_UNKNOW = 'unknow error';

ApplicationException.ERROR_TOKEN_EXPIRE = 'user token expire';

// export the class
module.exports = ApplicationException;