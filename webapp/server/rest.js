const Path = require('path');
const fsp = require('fs').promises;
const fs = require('fs');
const {encode, decode} = require('@grunmouse/varname-notation');



/**
 * Функции, предназначенные для
 */
async function rest(path, res, req){
	let m = path.match(/^\/rest\/([a-z0-9_\-]+)(?:\?(.+))?/);
	if(!m){
		console.log(path);
	}
	let [_, entity, query] = m;
	
	let {method} = req;
	
	if(entity.indexOf('file')===0){
		let filepath = Path.join(module.path, '../file', path.slice(10));
		console.log(filepath);
		if(method === 'GET'){
			let open = fs.createReadStream(filepath);
			res.writeHead(200, {'Content-Type':'text/plain'});
			
			open.pipe(res);
		}
		else if(method === 'PUT'){
			let open = fs.createWriteStream(filepath);
			
			req.pipe(open);
			
			req.on('end', ()=>{
				res.writeHead(204);
				res.end();
			});
		}
	}
}

module.exports = rest;