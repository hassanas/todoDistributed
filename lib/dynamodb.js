const AWS = require('aws-sdk');
const fs = require("fs");
const path = require("path");
const ddbpath = path.join(__dirname, '../dynamodb/');

const createTable = async function (tname, ddb) {
	try {
		await fs.promises.stat(path.join(ddbpath, tname, "/schema.js"));
	}
	catch (e) {
		return console.error(`Error ${e.errno} Code ${e.code} while reading File ${e.path}`);
	}

	let table = require(path.join(ddbpath, tname, "/schema"));
	if (!table.schema) {
		return console.error(`Incorrect Schema file ${tname}/schema.js missing schema`);
	}
	try {
		table.schema.TableName = tname;
		await ddb.createTable(table.schema).promise();
		console.log(`Table ${tname} created `)
	}
	catch (e) {
		return console.log(`Error while creating table ${tname} `, e);
	}
	await seedTable(tname);
}

const seedTable = async function (tname) {
	const docClient = new AWS.DynamoDB.DocumentClient();
	try {
		await fs.promises.stat(path.join(ddbpath, tname, "/seed.json"));
	}
	catch (e) {
		return
	}

	let seeds = require(path.join(ddbpath, tname, "/seed.json"));
	try {
		for await (const seed of seeds) {
			let param = {
				TableName: tname,
				Item: seed
			}
			await docClient.put(param).promise();
		}
	}
	catch (e) {
		return console.log(`Error while creating table ${tname}`);
	}

}

const deleteTable = async function (tname, ddb) {
	try {
		await ddb.deleteTable({ TableName: tname }).promise();
		console.log(`Table ${tname} deleted `)
	}
	catch (e) {
		console.log("failed to delete table ", e)
	}
}

exports.apply = async function (app) {
	const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
	let tables = await ddb.listTables({ Limit: 100 }).promise();
	let dir = await fs.promises.opendir(ddbpath);
	tables = tables.TableNames;
	let tmade = [];
	for await (const dirent of dir) {
		if (!tables.find(t => t === dirent.name)) {
			await createTable(dirent.name, ddb)
		}
		tmade.push(dirent.name)
	}
	/*tables.forEach(async function(tname){
		if(!tmade.find(t => t == tname)){
			await deleteTable(tname,ddb)
		}
	})*/
}

