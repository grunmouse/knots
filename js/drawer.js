const Stack = require('@grunmouse/stack');
const {symbols:{SUB, ADD, MUL, DIV}} = require('@grunmouse/multioperator-ariphmetic');

const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');
const binary = require("@grunmouse/binary");
const {sortLines} = require('./graph-line.js');

function key(vec){
	let buff = new Float64Array.from(vec).buffer;
	
	let value = binary.bigint.fromBuffer(buff);
	
	return value;
}



const dict = {
	//Присвоить переменную [value, name]
	edef:(env)=>{
		let name = env.stack.pop();
		let value = env.stack.pop();
		env.vars.set(name, value);
	},
	//Читать переменную [name] => [value]
	read:(env)=>{
		let name = env.stack.pop();
		if(!env.vars.has(name)){
			throw new Error(`Unknown variable ${name}`);
		}
		let value = env.vars.get(name);
		env.stack.push(value);
	},
	//Сохранить в переменную положение пера
	save:env=>{
		let name = env.stack.pop();
		env.vars.set(name, env.pen);
	},
	repeat:env=>{
		let count = env.stack.pop();
		let proc = env.stack.pop();
		for(;count--;){
			env.runProc(proc);
		}
	},
	
	xy:({stack})=>{
		let point = stack.pop();
		stack.push(point.x);
		stack.push(point.y);
	},
	z:({stack})=>{
		let point = stack.pop();
		stack.push(point.z);
	},
	
	sub:({stack})=>{
		let y = stack.pop();
		let x = stack.pop();
		let value = x[SUB](y);
		stack.push(value);
	},
	add:({stack})=>{
		let y = stack.pop();
		let x = stack.pop();
		let value = x[ADD](y);
		stack.push(value);
	},
	mul:({stack})=>{
		let y = stack.pop();
		let x = stack.pop();
		let value = x[MUL](y);
		stack.push(value);
	},
	div:({stack})=>{
		let y = stack.pop();
		let x = stack.pop();
		let value = x[DIV](y);
		stack.push(value);
	},
	
	
	
};

const marker = new Symbol();

class DSL{
	constructor(){
		this.pen = Vector3.O();
		this.drawing = false;
		this.vars = new Map();
		this.lines = [];
		this.stack = new Stack();
		this.points = new Map();
		this.proc = 0; //Глубина вложения скобок при компиляции
	}
	
	moveto(point){
		this.pen = point;
	}
	
	lineto(point){
		let {pen} = this;
		if(point.z === pen.z || point.x === pen.x && point.y === pen.y){
			this.lines.push(pen, point);
			this.pen = point;
		}
		else{
			throw new Error('Incorect point for lineto');
		}
	}
	
	runCommand(command, i){
		if(this.proc === 0){
			//Режим выполнения
			if(command === '{'){
				let proc = [];
				stack.push(proc);
			}
			else if(dict[command]){
				try{
					dict[command](this);
				}
				catch(e){
					throw new Error(e.message + ` in ${command} # ${i}`);
				}
			}
			else if(!isNaN(command)){
				this.stack.push(+command);
			}
			else if(command[0]==='/'){
				this.stack.push(command);
			}
			else{
				throw new Error(`Unknown command ${command} # ${i}`);
			}
		}
		else if(this.proc === 1){
			if(command === '{'){
				this.proc++;
				this.stack.top.push([command, i]);
			}
			else if(command === '}'){
				this.proc = 0;
			}
			else{
				this.stack.top.push([command, i]);
			}
		}
		else if(this.proc > 1){
			if(command === '{'){
				this.proc++;
			}
			else if(command === '}'){
				this.proc--;
			}
			this.stack.top.push([command, i]);
		}
	}
	
	run(commands){
		for(let i = 0, len = commands.length; i<len; ++i){
			this.runCommand(commands[i], i);
		}
	}
	
	runProc(items){
		for(let [command, i] of items){
			this.runCommand(command, i);
		}
	}
}