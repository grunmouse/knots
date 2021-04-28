//89, 65

const http = require('http');

const mapping = {
	common : require('./common.js'),
	client :  require('./client.js'),
	vue :  require('./vue.js')
};


async function eval(path, res, req){
	let m = path.match(/^\/([^\/]+)\//);
	if(!m){
		res.writeHead(200, {'Content-Type':'text/html'});
		res.end("Hello, world!");
	}
	else{
		let [_, name] = m;
		
		let fun = mapping[name];
		
		try{
			await fun(path, res, req);
		}
		catch(e){
			console.log(e);
			res.writeHead(500);
			res.end(e.message);
		}
	}
}


const requestListener = function (req, res) {
	let path = req.url;
	
	eval(path, res, req).catch(console.log);
}


module.exports = (port)=>(
	new Promise((resolve, reject)=>{
		const server = http.createServer(requestListener);
		server.listen(port, (err)=>{
			if(err){
				reject(err);
			}
			else{
				console.log(`Map loader listering on port ${port}`);
				resolve(server);
			}
		})
	})
);