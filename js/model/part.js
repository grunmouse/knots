const {
	cyclicSubarr,
	cyclicSplice,
	extendedSubarr,
	extendedSplice
} = require('../utils/array.js');

const {Vector, Vector2, Vector3} = require('@grunmouse/math-vector');

const extendVector = require('./extend-vector.js');

const LineEdge = require('./edge.js');

const {isosceles, deltoid, isCollinear} = require('../geometry/polyline.js');

/** 
 * Базовый класс связных компонент и их частей
 * Связная компонента представляет собой массив точек
 */
class ComponentPart extends Array {
	
	clone(){
		let result = this.slice(0);
		result.closed = this.closed;
		result.color = this.color;
		result.width = this.width;
		result.type = this.type;
		
		return result;
	}
	
	storeToPoint(){
		this[0].color = this.color;
		this[0].width = this.width;
		this[0].type = this.type;
	}
	
	restoreFromPoint(){
		this.color = undefined;
		this.width = undefined;
		this.type = undefined;
		
		const doSet = (prop, i)=>{
			if(!this[prop] && this[0][prop]){
				this[prop] = this[0][prop];
			}
		}
		
		for(let i = 0; i<this.length; ++i){
			doSet('color', i);
			doSet('width', i);
			doSet('type', i);
		}
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
	
	/**
	 * Обобщает splice на случай выхода за границы массива
	 */
	esplice(index, deleteCount, ...items){
		if(this.closed){
			return cyclicSplice(this, index, deleteCount, ...items);
		}
		else{
			return extendedSplice(this, index, deleteCount, ...items);
		}
	}
	
	emap(callback){
		return this.map((v, i, arr)=>(extendVector(callback(v, i, arr), v)));
	}
	
	concat(...items){
		let result = super.concat(...items);
		result.started = this.started;
		result.ended = items[items.length-1].ended;
	}
	
	/**
	 * Если компонента не замкнутая, то разворачивает её так, чтобы конечная точка была последней
	 */
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
			result.push(new LineEdge(this[i-1], this[i], i, this));
		}
		if(this.closed){
			result.push(new LineEdge(this[len-1], this[0], 0 , this));
		}
		return result;
	}
	
	findPoint(A){
		return this.findIndex((P)=>(P.eq(A)));
	}
	
	/**
	 * Окрестность точки
	 * @param A - точка
	 * @param prev - смещение начала выборки
	 * @param post - смещение конца выборки
	 */
	pointRange(A, prev, post){
		let i = this.findPoint(A);
		if(i>-1){
			let len = post - prev + 1;
			return this.subarr(i+prev, len);
		}
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
		let [A, B] = this.subarr(index-1, 2);
		let C = A.add(B).div(2);
		this.splice(index, 0, C);
	}

	/**
	 * Прокрутка замкнутой ломаной
	 * @param value : Number - количество шагов, на которые прокручивается ломаная
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
	
	/**
	 * Удаляет вырожденные вершины (такие, для которых смежные отрезки совпадают)
	 */
	killPins(){
		for(let i = 0; i<this.length; ++i){
			let [A, B, C] = this.subarr(i-1, 3);
			if(A && C && A.eq(C)){
				this.esplice(i, 2);
				i-=2;
			}
		}
	}
	
	/**
	 * Удлинняет концы разомкнутой ломаной
	 */
	expandEnds(ex){
		
		if(this.closed){
			return this;
		}
		let A = this[0], B = this[1], D = this[this.length-1], C = this[this.length-2];
		if(!B){
			console.log(this);
		}
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
		result.width = this.width;
		result.z = this.z;
		
		return result;
	}	
	
	/**
	 * Находит наибольший разрешённый радиус скругления для точки
	 */
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
		result.width = this.width;
		result.z = this.z;
		
		return result;
		
	}
	
}

[
	"cut",
	"extend"
].forEach(method=>{
	ComponentPart.prototype[method] = function(...args){
		return this.map(vector=>(extendVector(vector[method](...args), vector)));
	}
});

module.exports = ComponentPart;