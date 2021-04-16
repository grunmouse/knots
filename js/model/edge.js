const inspect = Symbol.for('nodejs.util.inspect.custom');

const extendVector = require('./extend-vector.js');
const util = require('util');

class LineEdge{
	/**
	 *
	 */
	constructor(A, B, index, parent){
		this[0] = this.A = A;
		this[1] = this.B = B;
		this.index = index;
		this.parent = parent;
	}
	
	
	[inspect](depth, options){
		//console.log(options);
		let name = this.constructor.name;
		let A = util.inspect(this.A);
		let B = util.inspect(this.B);
		
		return `${name} [${A}, ${B}]`;
		
	}
	
	*[Symbol.iterator](){
		yield this.A;
		yield this.B;
	}
	
	get length(){
		return 2;
	}
	
	map(callback){
		return new this.constructor(
			callback(this.A, 0, this),
			callback(this.B, 1, this),
			this.index,
			this.parent
		);
	}
}

[
	"cut",
	"extend"
].forEach(method=>{
	LineEdge.prototype[method] = function(...args){
		return this.map(vector=>(extendVector(vector[method](...args), vector)));
	}
});

module.exports = LineEdge;