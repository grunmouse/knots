const Path = require('path');
const fsp = require('fs').promises;
const {encode, decode} = require('@grunmouse/varname-notation');

/**
 * Запрос на cjs-модули из @grunmouse
 */
 
async function common(path, res){
	let modulepath = path.slice('/common/'.length);
	let filepath = /\.js$/.test(modulepath) ? modulepath : Path.join(modulepath,'index.js');
	
	let code = await fsp.readFile(Path.join(require.main.path, 'node_modules\\@grunmouse', filepath), {encoding:'UTF-8'});
	
	let deps = new Set();
	
	let filename = Path.basename(filepath);
	let dirname = Path.dirname(filepath);
	let mapping = [];

	code.replace(/(?:[;=:,\[]|\.{3})\s*require\s*\(\s*("(?:[^"]|\\\\|\\")+"|'(?:[^']|\\\\|\\')+')\s*\)/g,(str, arg)=>{
		var name = eval('('+arg+')');
		if(name.indexOf('@grunmouse')===0){
			let packdir = dirname.split(/[\/\\]/g)[0];
			var absname = Path.join(packdir, 'node_modules', name).split('\\').join('/');
		}
		else{
			if(name === 'util'){
				console.log(filename);
			}
			var absname = Path.join(dirname, name).split('\\').join('/');
		}
		
		deps.add(absname);
		mapping.push([name, encode(absname)]);
	});
	
	let imports = [];
	for(let name of deps){
		let key = encode(name);
		imports.push(`import ${key} from '/common/${name}';`);
	}
	
	imports = imports.join('\n');
	
	mapping = '{\n' + mapping.map(([name, key])=>('\t' + JSON.stringify(name) + ': ' + key)).join(',\n') + '\n}';
	
	const req = `function(name){return ${mapping}[name];}`;
	
	let func = `function(exports, require, module, __filename, __dirname){ ${code} }`;
	
	
	let module = `
${imports}

const module = {exports:{}};
const require = ${req};
(${func})(module.exports, require, module, "${filename}", "${dirname}");

export default module.exports;
	`;
	
	res.writeHead(200, {'Content-Type':'text/javascript'});
	res.end(module);
}

module.exports = common;