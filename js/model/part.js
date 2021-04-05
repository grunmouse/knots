const {
	cyclicSubarr,
	cyclicSplice,
	extendedSubarr,
	extendedSplice
} = require('./array.js');

const {Vector, Vector2, Vector3} = require('@grunmouse/math-vector');

const extendVector = require('./extend-vector.js');

class ComponentPart extends Array {
	
	clone(){
		let result = this.slice(0);
		result.closed = this.closed;
		result.color = this.color;
	}
	
	get closed(){
		return this._closed;
	}
	
	set closed(value){
		this._closed = value;
		if(value){
			this.started = false;
			this.ended = false;
		}
	}
	
	get started(){
		return !this.closed && this[0].starting;
	}
	
	set started(value){
		if(value && this.closed){
			throw new Error('Closed component can not by started');
		}
		this[0] = extendVector(this[0], 'starting', !!value);
	}
	
	get ended(){
		return !this.closed && this[this.length-1].ending;
	}
	
	set ended(value){
		if(value && this.closed){
			throw new Error('Closed component can not by ended');
		}
		this[this.length-1] = extendVector(this[this.length-1], 'ending', !!value);
	}
	
	concat(...items){
		let result = super.concat(...items);
		result.started = this.started;
		result.ended = items[items.length-1].ended;
	}
	
	controlOrder(){
		if(!this.closed){
			if(this[0].ending || this[this.lenght-1].starting){
				this.reverse();
			}
		}
	}
	
	edges(){
		let result = [], len = this.length;
		for(let i=1; i<len; ++i){
			result.push([this[i-1], this[i]]);
		}
		if(this.closed){
			result.push([this[len-1], this[0]]);
		}
		return result;
	}
}

module.exports = ComponentPart;