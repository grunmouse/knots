
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
		
		get lastComponent(){
			return this.components[this.components.length -1];
		}
		
		static draw(code, params){
			let tokens = lexer(code);
			let ast = trans(tokens);
			//console.log(inspect(ast, {depth:20, colors:true}));
			const env = new this();
			if(params){
				for(let key in params){
					env.vars.set(key, params[key]);
				}
			}
			
			let result = env.eval(ast);
			
			env.returned = result;
			
			return env;
			
		}
	}
	
	Drawer.prototype.lib = lib;
	
	return Drawer;
}


module.exports = DrawerBase;