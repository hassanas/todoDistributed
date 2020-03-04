const crypto = require('crypto');
const validatePayload = require('./validatorPayload');
const genRandomString = function (length = 16) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
}

module.exports = {

    /**
     * hash password with sha512.
     * @function
     * @param {string} password - List of required fields.
     */
    sha512: function (password) {
        var salt = genRandomString(16); /** Gives us salt of length 16 */
        var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
        hash.update(password);
        var value = hash.digest('hex');
        return {
            salt: salt,
            passwordHash: value
        };
    },

    sha512WithUserSalt: function (password, userSalt) {
        var hash = crypto.createHmac('sha512', userSalt); /** Hashing algorithm sha512 */
        hash.update(password);
        return hash.digest('hex');
    },

    genRandomString,

    compareLoginPassword: function (dbPassword, userPassword) {
        return validatePayload.compareStrings(dbPassword, userPassword);
    }

};