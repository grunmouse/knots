const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');

const dirmap = require('./dirmap.js');
const DrawerBase = require('./dsl/index.js');

const LevelsDiagram = require('../model/levels-diagram.js');
const LayeredComponent = require('../model/layered-component.js');


const lib = {
	com:{
		log(...arg){
			console.log(...arg);
		},
		scale(xy, z){

		},
		zscale(z){

		},
		draw(){
			this.drawing = true;
		},
		move(){
			this.drawing = false;
		},
		u(){
			this.up();
		},
		d(){
			this.down();
		},
		h(){
			this.swaplevel();
		},
		go(x, y){
			let pos;
			if(x instanceof Vector){
				pos = x.cut(2).extend(this.z);
			}
			else{
				pos = new Vector(x, y, this.z);
			}
			this.go(pos);
		},
		level(z){
			let pos;
			if(z instanceof Vector){
				z = z[2];
			}
			let level = Math.round(z/this.zscale);
			if(level !== this.level){
				this.swaplevel();
			}
		},
		defpos(varname){
			let name = varname.raw;
			this.vars.set(name, this.pos);
		},
		f(){
			this.lastComponent.ended = true;
		}
	},
	fun:{
	}
};

for(let key in dirmap){
	lib.com[key] = function(len){
		len = len || 1;
		let step = dirmap[key].mul(len).extend(0);
		let pos = this.pos.add(step);
		this.go(pos);
	}
}


class TwoLevelDrawer extends DrawerBase(lib){
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
		if(this._append){
			this.lastComponent().push(pos);
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
	
	up(){
		if(this.level === 0){
			let pos = this.pos.cut(2).extend(1);
			this.go(pos);
			return true;
		}
	}
	
	down(){
		if(this.level === 1){
			let pos = this.pos.cut(2).extend(0);
			this.go(pos);
			return true;
		}
	}
	
	swaplevel(){
		this.up() || this.down();
	}
}

module.exports = TwoLevelDrawer;