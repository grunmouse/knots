const Path = require('path');
const fs = require('fs');

const mapping = {
	'.js':'text/javascript',
	'.html':'text/html',
	'.htm':'text/html',
	'.css':'text/css',
	'.json':'application/json'
};
/**
 * Загрузка статики из модуля vue
 */

function client(path, res){
	let pathname = new URL(path, 'http://localhost/').pathname;
	let filepath = Path.join(require.main.path, 'node_modules', pathname);
	
	let ext = Path.extname(path);
	
	let type = mapping[ext] || 'text/html';
	
	let open = fs.createReadStream(filepath);
	res.writeHead(200, {'Content-Type':type});
	
	open.pipe(res);
}

module.exports = client;