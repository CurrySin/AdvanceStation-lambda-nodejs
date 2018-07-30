const ApplicationException = require('./model/applicationException.js');


function Environment(status) {
    this.region;
    this.identity_pool_id;
    this.user_pool_id;
    this.client_id;
    switch (status) {
        case 'dev':
            this.region = 'ap-southeast-1';
            this.identity_pool_id = 'ap-southeast-1:0180e004-4604-4084-a3fd-d3f30d95792b';
            this.user_pool_id = 'ap-southeast-1_nDGaTHnwl';
            this.client_id = '6hekkua5bovsd9e685dfvnbiut';
            this.db_table_service = 'curry-test-table';
            break;
        case 'prod':

            break;
        default:
            throw new Error(ApplicationException.ERROR_CODE_ENV_WRONG_IPUT);
    }
}

Environment.APP_STATUS = 'dev';
Environment.ATTRIBUTE_PARAM_EMAIL = 'email';
Environment.ATTRIBUTE_PARAM_MOBILE = 'phone_number';
Environment.ATTRIBUTE_PARAM_LICENSE_PLATE = 'custom:LicensePlate';


module.exports = Environment;