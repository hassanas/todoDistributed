const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const hashUtils = require('../hashUtils');
const validatePayload = require('../validatorPayload');

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
        try {
            let params = {
                TableName: "userProfiles",
                KeyConditionExpression: "user_name = :username",
                ExpressionAttributeValues: {
                    ":username": username
                }
            }
            let user = await awsDynamo.query(params).promise();

            response.statusCode = 200;
            if (user.Count) {
                response.error = 'account_already_exists';
                response.error_description = 'An account already exists with this email address.';
            } else {
                let saltandPass = hashUtils.sha512(password);
                let items = {
                    user_name: username,
                    passwrod: saltandPass.passwordHash,
                    salt: saltandPass.salt
                }
                let param = {
                    TableName: "userProfiles",
                    Item: items
                }

                await awsDynamo.put(param).promise();

                let token = jwt.sign({ "userid": username }, process.env.jwtprivatekey, { algorithm: 'HS256' });//This is synchronous call
                response.access_token = token;
                response.expires_in = process.env.tokenLife;
            }
        } catch (e) {
            console.log(e);
            response.statusCode = 500;
            response.error = 'invalid_request';
            response.error_description = 'The request is missing a parameter so the server can’t proceed with the request.';
        }
    } else {
        response.error = 'invalid_request';
        response.error_description = 'The request is missing a parameter so the server can’t proceed with the request.';
    }
    response.body = JSON.stringify(response);
    return response;
};