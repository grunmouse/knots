const {symbols:{ADD, SUB, MUL, DIV, POW, NEG}} = require("@grunmouse/multioperator-ariphmetic");

const noop = (()=>{});

const doeval = (env, ast)=>(ast.data.map((item)=>(env.eval(item))));

const dissipe = (env, ast)=>(env.eval(ast.data[0]));

const raw = (env, ast)=>(ast.raw);

const infixmap = {
	'+':ADD,
	'-':SUB,
	'*':MUL,
	'/':DIV
};

const mapping = {
	"<EOF>":noop,
	"<MAIN>":doeval,
	"PROG":doeval,
	"STAT":(env, ast)=>{
		let [command, args] = ast.data;
		args = args && env.eval(args);
		env.command(command.raw, args || []);
	},
	"REP":(env, ast)=>{
		let prog = ast.data[1];
		if(!prog.data) return;
		let count = ast.data[4];
		count = env.eval(count, true);
		for(let i=0; i<count; ++i){
			env.eval(prog);
		}
	},
	"ARGS":(env, ast)=>{
		let args = ast.data;
		return args.map((a)=>(env.eval(a))).flat();
	},
	"SPREED 2":(env, {data})=>{
		let a = env.eval(data[1], true);
		return a;
	},
	"ARG 1":(env, {data})=>{
		let a = env.eval(data[0]);
		return [a];
	},
	"EXP":dissipe,
	"SUMM 3":(env,{data})=>{
		let [a, ots, b] = data;
		a = env.eval(a, true);
		b = env.eval(b, true);
		let OP = infixmap[ots.raw];
		return a[OP](b);
	},
	"SUMM 1":dissipe,
	"MULT 3":(env,{data})=>{
		let [a, otm, b] = data;
		a = env.eval(a, true);
		b = env.eval(b, true);
		let OP = infixmap[otm.raw];
		return a[OP](b);
	},
	"MULT 1":dissipe,
	"SIGNED":(env, {data})=>{
		let [sig, a] = data;
		a = env.eval(a, true);
		if(sig.raw === '-'){
			a = a[NEG]();
		}
		return a;
	},
	"RATIONAL":(env, {data})=>{
		let [sig, a] = data;
		a = env.eval(a, true);
		if(sig.raw === '/'){
			a = 1/a;
		}
		return a;
	},
	"POW 3":(env, {data})=>{
		let [a, otp, b] = data;
		a = env.eval(a, true);
		b = env.eval(b, true);
		if(otp === '*/'){
			b = 1/b;
		}
		return a[POW](b);
	},
	"POW 1":dissipe,
	"MULTIPLIER":dissipe,
	"SUMMAND":dissipe,
	"value":(env,{raw})=>{
		let value = +raw;
		if(isNaN(value)){
			throw new SyntaxError(`Incorrect value ${value}`);
		}
		return value;
	},
	"varname":(env, item)=>{
		if(env.vars.has(item.raw)){
			return env.vars.get(item.raw);
		}
		else if(env.strong){
			throw new Error(`Variable ${item.raw} is not defined`);
		}
		else{
			return item;
		}
	},
	"FUNCALL":(env, {data})=>{
		let name = data[0], args = data[3];
		args = env.eval(args, true);
		
		return env.funcall(name, args);
	}
};



class EnvironmentBase{
	constructor(){
		this.vars = new Map();
	}
	command(name, args){
		let method = this.lib.com[name];
		method.apply(this, args)
	}
	funcall(name, args){
		let fun = this.lib.fun[name];
		return fun.apply(this, args);
	}
}

EnvironmentBase.prototype.eval = require('./eval-method.js')(mapping);

module.exports = EnvironmentBase;