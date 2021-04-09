const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');

const DrawerBase = require('./dsl/index.js');

const LevelsDiagram = require('../model/levels-diagram.js');
const LayeredComponent = require('../model/layered-component.js');

const dirmap = require('./dirmap.js');

const lib = {
	com:{
		log(...arg){
			console.log(...arg);
		},
		draw(){
			this.drawing = true;
		},
		move(){
			this.drawing = false;
		},
		u(z){
			if(z === 0){
				return;
			}
			z = z || 1;
			z = this.level + z;
			this.goLevel(z);
		},
		d(z){
			if(z === 0){
				return;
			}
			z = z || 1;
			z = this.level - z;
			this.goLevel(z);
		},
		go(x, y){
			let pos;
			if(x instanceof Vector){
				pos = x.cut(2).extend(this.pos.z);
			}
			else{
				pos = new Vector(x, y, this.pos.z);
			}
			this.go(pos);
		},
		level(z){
			if(z instanceof Vector){
				z = z[2];
			}
			this.goLevel(z);
		},
		savepos(varname){
			let name = varname.raw;
			this.vars.set(name, this.pos);
		},
		"let":function(varname, value){
			let name = varname.raw;
			this.vars.set(name, value);
		},
		f(){
			this.lastComponent.ended = true;
		}
	},
	fun:{
		xy(vec){
			return vec.cut(2);
		},
		z(vec){
			return vec.z;
		},
		vec(x, y, z){
			return new Vector3(x, y, z);
		}
	}
};

for(let key in dirmap){
	lib.com[key] = function(len){
		if(len === 0){
			return;
		}
		len = len || 1;
		let step = dirmap[key].mul(len).extend(0);
		let pos = this.pos.add(step);
		this.go(pos);
	}
}

lib.com.l = lib.com.u;

class MultiLevelDrawer extends DrawerBase(lib){
	constructor(){
		super();
		this._append = false;
		this.pos = Vector3.O();
		this.drawing = false;
	}
	
	get level(){
		return this.pos.z;
	}
	
	lineto(pos){
		if(!pos instanceof Vector3){
			throw new Error('Incorrect class!');
		}
		if(this._append){
			this.lastComponent.push(pos);
			this.pos = pos;
		}
		else{
			this.components.push(new LayeredComponent(this.pos, pos));
			this._append = true;
			this.pos = pos;
		}
	}
	moveto(pos){
		this._append = false;
		this.pos = pos;
	}
	
	go(pos){
		if(this.drawing){
			this.lineto(pos);
		}
		else{
			this.moveto(pos);
		}
	}
	
	goLevel(z){
		let pos = new Vector(this.pos.x, this.pos.y, z);
		this.go(pos);
	}
}

module.exports = MultiLevelDrawer;