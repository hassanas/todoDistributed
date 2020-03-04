const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const validatePayload = require('../validatorPayload');
const hashUtils = require('../hashUtils');

exports.handler = async (event) => {

    const dynamodb = new AWS.DynamoDB({
        maxRetries: 10,
        retryDelayOptions: {
            base: 500
        }
    });

    const awsDynamo = new AWS.DynamoDB.DocumentClient({
        service: dynamodb,
        convertEmptyValues: true,
    });

    let response = {
        statusCode: 400
    };

    const client_id = event.body.client_id;
    const client_secret = event.body.client_secret;
    const username = event.body.username;
    const password = event.body.password;
    if (validatePayload.validAccountPayload(username, password, client_id, client_secret)) {
        let params = {
            TableName: "userProfiles",
            KeyConditionExpression: "user_name = :username",
            ExpressionAttributeValues: {
                ":username": username
            }
        }
        let user = await awsDynamo.query(params).promise();

        if (user.Count) {
            response.error = 'invalid_grant';
            response.error_description = 'User name or password is incorrect.';
            response.statusCode = 401;

            if (hashUtils.compareLoginPassword(user.Items[0].passwrod, hashUtils.sha512WithUserSalt(password, user.Items[0].salt))) {
                let token = jwt.sign({ "userid": username }, process.env.jwtprivatekey, { algorithm: 'HS256' });//This is synchronous call
                response.access_token = token;
                response.expires_in = process.env.tokenLife;
                delete response.error;
                delete response.error_description;
                response.statusCode = 200;
            }
        }
    } else {
        response.error = 'invalid_request';
        response.error_description = 'The request is missing a parameter so the server can’t proceed with the request.';
    }
    response.body = JSON.stringify(response);
    return response;
};