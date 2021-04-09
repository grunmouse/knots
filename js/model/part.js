const {
	cyclicSubarr,
	cyclicSplice,
	extendedSubarr,
	extendedSplice
} = require('../utils/array.js');

const {Vector, Vector2, Vector3} = require('@grunmouse/math-vector');

const extendVector = require('./extend-vector.js');

const {isosceles, deltoid, isCollinear} = require('../geometry/polyline.js');

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
	
	/**
	 * Возвращает подмассив
	 */
	subarr(index, length){
		if(this.closed){
			return cyclicSubarr(this, index, length);
		}
		else{
			return extendedSubarr(this, index, length);
		}
	}
	
	esplice(index, deleteCount, ...items){
		if(this.closed){
			return cyclicSplice(this, index, deleteCount, ...items);
		}
		else{
			return extendedSplice(this, index, deleteCount, ...items);
		}
	}
	

	concat(...items){
		let result = super.concat(...items);
		result.started = this.started;
		result.ended = items[items.length-1].ended;
	}
	
	controlOrder(){
		if(!this.closed){
			if(this[0].ending || this[this.length-1].starting){
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
	
	findPoint(A){
		return this.findIndex((P)=>(P.eq(A)));
	}
	
	findEdge(A, B){
		let index = this.findIndex((P)=>(P.eq(A)));
		if(index>-1){
			let [P, Q] = this.subarr(index, 2);
			if(Q && Q.eq(B)){
				index = (index+1)%this.length;
				return index;
			}
		}
		return -1;
	}
	
	hasEdge(A, B){
		let index = this.findIndex((P)=>(P.eq(A)));
		if(index>-1){
			let [R, P, Q] = this.subarr(index-1, 3);
			if(Q && Q.eq(B) || R && R.eq(B)){
				return true;
			}
		}
		return false;
	}
	
	isCollinear(index, eps){
		let [A, B, C] = this.subarr(index-1, 3);
		return !!A && !!C && isCollinear([A, B], [B, C], eps);
	}	
	
	/**
	 * Добавляет среднюю точку отрезка, в позицию index (между index-1 и бывшим index)
	 */
	addMiddle(index){
		let [A, B] = this.subarray(index-1, 2);
		let C = A.add(B).div(2);
		this.splice(index, 0, C);
	}

	/**
	 * Прокрутка замкнутой ломаной
	 */
	rot(value){
		if(this.closed && value != 0){
			let len = this.legnth;
			value %= len;

			if(value>0){
				let items = this.splice(0, value);
				this.push(...items);
			}
			else if(value<0){
				let items = this.splice(len - value, value);
				this.unshift(...items);
			}
		}
	}
	
	/**
	 * Прокручивает замкнутую ломаную так, чтобы точка начала не была скруглена
	 * Если такой точки нет - добавляет её
	 */
	rotStartToLine(){
		if(this.closed){
			let index = this.findIndex((a, i)=>(!a.radius));
			if(index === -1){
				this.addMiddle(0);
				index = 0;
			}
			if(index != 0){
				this.rot(index);
			}
		}
	}
	
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
		
		let result = new this.constructor(A1, ...this.slice(1, -1), D1);
		
		//result.ended = this.ended;
		//result.started = this.started;
		result.color = this.color;
		result.z = this.z;
		
		return result;
	}	
	
	maxRadius(index, ex, eps){
		ex = ex || 0;
		let [A, B, C, D, E] = this.subarr(index-2, 5);
		if(!B || !D){
			//Если C - концевая точка
			return 0;
		}
		let a = B.sub(C).abs();
		let b = D.sub(C).abs();
		if(A && !isCollinear([A, B], [B, C], eps)){
			//Если B не концевая точка
			a /= 2;
		}
		else{
			a -= ex;
		}
		if(E && !isCollinear([C, D], [D, E], eps)){
			b /= 2;
		}
		else{
			b -= ex;
		}
		let s = Math.min(a, b);
		[B, C, D] = isosceles(B, C, D, s);
		let F = deltoid(B, C, D);
		
		return F.sub(B).abs()
	}
	
	roundedMaxRadius(ex, eps){
		let result = this.map((vector, i)=>extendVector(this[i], 'radius', this.maxRadius(i, ex, eps)));

		result.color = this.color;
		result.z = this.z;
		
		return result;
		
	}
}

module.exports = ComponentPart;