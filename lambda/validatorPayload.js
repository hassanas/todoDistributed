const validator = require('validator');

module.exports = {

    validAccountPayload: (username, password, client_id, client_secret) => {
        if (!validator.isEmpty(username) && validator.isEmail(username) && !validator.isEmpty(password) && validator.equals(client_id, process.env.client_id) && validator.equals(client_secret, process.env.client_secret)) {
            return true;
        }
        else {
            return false;
        }
    },
    compareStrings: (str1, str2) => {
        return validator.equals(str1, str2);
    }
};