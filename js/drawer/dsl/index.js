
const makeLexer = require('./lexer.js');
const EnvironmentBase = require('./evaluate.js');
let trans = require('./translator.js');

function DrawerBase(lib){

	const lexer = makeLexer(lib);
	
	const Drawer = class extends EnvironmentBase{
		constructor(){
			super();
			this.components = [];
		}
		
		lastComponent(){
			return this.components[this.components.length -1];
		}
		
		static draw(code, params){
			let tokens = lexer(code);
			let ast = trasn(tokens);
			
			const env = new this();
			if(params){
				for(let key in params){
					env.vars.set(key, params[key]);
				}
			}
			
			let result = env.eval(ast);
			
			if(result == null){
				result = env;
			}
			
			return result;
			
		}
	}
	
	Drawer.prototype.lib = lib;
	
	return Drawer;
}


module.exports = DrawerBase;