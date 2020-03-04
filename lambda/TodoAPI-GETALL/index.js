const AWS = require('aws-sdk');

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

    let params = {
        TableName: "todos"
    }
    let response = {
        statusCode: 400,
        body: ""
    };
    try {
        let todo = await awsDynamo.scan(params).promise();
        response.statusCode = 200;
        response.body = JSON.stringify(todo);

    } catch (e) {
        console.log(e)
        response.statusCode = 500;
        response.body = JSON.stringify(e);
    }

    return response;
};

