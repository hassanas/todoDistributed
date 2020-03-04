const fs = require("fs");
const path = require("path");
const gpath = path.join(__dirname, '../apigateway');
const lpath = path.join(__dirname, '../lambda/');


const applyParameters = function (api, resource, parameters) {
	let url = `/${api}/${resource}`;
	if (parameters) {
		for (let i = 0, l = parameters.length; i < l; i++) {
			url += '/:' + parameters[i];
		}
	}

	return url;
}

const applyRoutes = async function (app, methods, api, resource) {

	for (let j = 0, n = methods.length; j < n; j++) {
		let url = applyParameters(api, resource, methods[j].parameters);
		try {
			let rlp = path.join(lpath, methods[j].lambda);
			await fs.promises.stat(path.join(rlp, "/index.js"));
			let lambda = require(rlp);
			if (!lambda.handler) {
				console.error(`Incorrect Lambda file ${rlp}/index.js missing handler`);
				continue;
			}
			console.log(`  ${methods[j].method.toUpperCase()}  ${url} -> ${rlp}`);
			app[methods[j].method.toLowerCase()](url, async function (req, res) {
				let event = {};
				if (req.params && Object.keys(req.params).length > 0) {
					event.pathParameters = req.params;
				}
				if (req.body && Object.keys(req.body).length > 0) {
					event.body = req.body;
				}
				if (req.query && Object.keys(req.query).length > 0) {
					event.queryStringParameters = req.query;
				}
				let response = await lambda.handler(event);
				res.status(response.statusCode || 200);
				if (response.headers) {
					let keys = Object.keys(response.headers);
					for (let index in keys) {
						res.append(keys[index], response.headers[keys[index]])
					}
				}
				res.send(response.body || " ");
			})
		}
		catch (e) {
			console.error(`Error ${e.errno} Code ${e.code} while reading File ${e.path}`);
			continue;
		}
	}
}



exports.apply = async function (app) {
	const dir = await fs.promises.opendir(gpath);
	for await (const dirent of dir) {
		let gw = require(path.join(gpath, dirent.name));
		let api = dirent.name.split(".")[0];
		if (gw.api && Array.isArray(gw.api)) {
			console.log(`API : ${api}`)
			for (let i = 0, l = gw.api.length; i < l; i++) {
				let methods = gw.api[i].methods;
				if (!methods) {
					console.error("No Methods defined ignoring resource");
					break;
				}
				await applyRoutes(app, methods, api, gw.api[i].resource);
			}
		}
		else {
			console.error(`Incorrect apigateway file "${dirent.name}" Ignoring`);
		}
	}
}