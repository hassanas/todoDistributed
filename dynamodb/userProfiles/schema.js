exports.schema = {
    AttributeDefinitions: [
        {
            AttributeName: 'user_name',
            AttributeType: 'S'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'user_name',
            KeyType: 'HASH'
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
