const {
	cyclicSubarr,
	cyclicSplice,
	extendedSubarr,
	extendedSplice
} = require('./array.js');

const {Vector, Vector2, Vector3} = require('@grunmouse/math-vector');

const extendVector = require('./extend-vector.js');

const Part = require('./part.js');

class FlatPart extends Part{
	expandEnds(ex){
		
		if(this.closed){
			return this;
		}
		let A = this[0], B = this[1], D = this[this.length-1], C = this[this.length-2];
		let BA = A.sub(B);
		let CD = D.sub(C);
		
		let dA1 = BA.ort().mul(ex);
		let dD1 = CD.ort().mul(ex);
		let A1 = A.add(dA1);
		let D1 = D.add(dD1);
		
		A1 = extendVector(A1, A);
		D1 = extendVector(D1, D);
		
		//console.log(A1, A);
		//console.log(D1, D);
		
		let result = new FlatPart(A1, ...this.slice(1, -1), D1);
		
		//result.ended = this.ended;
		//result.started = this.started;
		result.color = this.color;
		result.z = this.z;
		
		return result;
	}
}

module.exports = FlatPart;