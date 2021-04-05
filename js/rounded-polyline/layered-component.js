const {
	intersectLinePart,
	isCollinear,
	wasLongest
} = require('./polyline.js');

const {Vector, Vector2, Vector3} = require('@grunmouse/math-vector');

const extendVector = require('./extend-vector.js');

function cyclicSubarr(arr, index, length){
	let len = arr.length;
	while(index >= len){
		index -= len;
	}
	if(index < 0){
		index = len - index;
	}
	
	if(index + length > len){
		length = index + length - len;
		let first = arr.slice(index);
		let last = arr.slice(0, length);
		let result = first.concat(last);
		return result;
	}
	else{
		return arr.slice(index, length);
	}
}

function cyclicSplice(arr, index, deleteCount, ...items){
	let len = arr.length;
	while(index >= len){
		index -= len;
	}
	if(index<0){
		index = len - index;
	}
	
	if(deleteCount === 0){
		if(index === 0){
			arr.push(...items);
		}
		else{
			arr.splice(index, 0, ...items);
		}
		return [];
	}
	else if(index + deleteCount > len){
		deleteCount = index + deleteCount - len;
		
		if(deleteCount > index){
			deleteCount = index;
		}
		
		let first = arr.splice(index, len, ...items);
		let last = arr.splice(0, deleteCount);
		return first.concat(last);
	}
	else{
		return arr.splice(index, deleteCount, ...items);
	}
}

function extendedSubarr(arr, index, length){
	let head, body, tail, len = arr.length;
	
	if(length === 0){
		return [];
	}

	if(index>=len){
		return new Array(length).fill(undefined);
	}

	if(index < 0){
		if(length <= -index){
			return new Array(length).fill(undefined);
		}
		head = new Array(-index).fill(undefined);
		index = 0;
	}
	else{
		head = [];
	}
	
	if(index + length > len){
		tail = new Array(index + length - len).fill(undefined);
		length = len - index;
	}
	else{
		tail = [];
	}
	
	body = arr.slice(index, index+length);
	
	return head.concat(body, tile);
}

function extendedSplice(arr, index, deleteCount, ...items){
	let head, body, tail, len = arr.length;
	
	if(index<0){
		head = new Array(-index).fill(undefined);
		arr.unshift(...head);
	}
	else{
		head = [];
	}
	
	if(index + deleteCount > len){
		tail = new Array(index + length - len).fill(undefined);
		arr.pop(...tail);
	}
	else{
		tail = [];
	}
	
	index += head.length;
	
	return arr.splice(index, deleteCount, ...items);
	
}

/**
 * @class LayeredComponent
 * Представляет связную компоненту многослойной диаграммы
 */
class LayeredComponent extends Array {
	
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
	
	/**
	 * Возвращает подмассив
	 */
	subarr(index, length){
		if(this.closed){
			return cyclicSubarr(this, index, length);
		}
		else{
			return extendedSubarr(this, index, lenght);
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
	
	isZ(index){
		let [A, B] = this.subarr(index, 2);
		return !!A && !!B && A.x === B.x && A.y === B.y && A.z !== B.z;
	}
	
	isXY(index){
		return !!A && !!B && A.z === B.z;
	}
	
	isAngle(index, eps){
		if(this.isZ(index)){
			let [A, B, C, D] = this.subarr(index-1, 4);
			return !!A && !!D && !isCollinear([A, B], [C, D], eps);
		}
		else if(this.isZ(index-1)){
			let [A, B, C, D] = this.subarr(index-2, 4);
			return !!A && !!D && !isCollinear([A, B], [C, D], eps);
		}
		else{
			let [A, B, C] = this.subarr(index-1, 3);
			return !!A && !!C && !isCollinear([A, B], [B, C], eps);
		}
	}
	
	isCollinear(index, eps){
		let [A, B, C] = this.subarr(index-1, 3);
		return !!A && !!C && isCollinear([A, B], [B, C], eps);
	}
	
	moveZtoMiddleRight(index){
		let [A, B, C] = this.subarr(index, 3);
		//AB || z
		let D = B.add(C).div(2);
		let E = new Vector3(D.x, D.y, A.z);
		//ED || z
		//[A, E, D, C]; 
		this.esplice(index+1, 1, E, D);
	}
	
	moveZtoMiddleLeft(index){
		let [A, B, C] = this.subarr(index-1, 3);
		//BC || z
		let D = B.add(A).div(2);
		let E = new Vector3(D.x, D.y, C.z);
		//DE || z
		//[A, D, E, C]
		this.esplice(index, 1, D, E);
	}
	moveZtoLeft(index){
		let [A, B, C, D] = this.subarr(index-1, 4);
		//BC || z
		let E = new Vector3(A.x, A.y, C.z);
		//AE || z
		//[A, E, C, D]
		this.esplice(index, 1, E);
	}

	moveZtoRight(index){
		let [A, B, C, D] = this.subarr(index-1, 4);
		//BC || z
		let E = new Vector3(D.x, D.y, B.z);
		//ED || z
		//[A, B, E, D]
		this.esplice(index+1, 1, E);
	}
	
	moveZtoAngle(index, eps){
		if(this.isAngle(index, eps)){
			return;
		}
		
		//CD || z

		if(!B && !E){
			return ;
		}
		
		let isAngleB = this.isAngle(index-1);
		let isAngleE = this.isAngle(index+2);
		if(isAngleB && isAngleE){
			let [B, C, D, E] = this.subarr(index-1, 4);
			//Выбираем ближний угол
			if(wasLongest([B, C], [D, E])>=0){
				//B, C, D, E
				//toE
				this.moveZtoRight(index);
			}
			else{
				//toB
				this.moveZtoLeft(index);
			}
		}
		else if(isAngleB){
			this.moveZtoLeft(index);
			
		}
		else if(isAngleE){
			this.moveZtoRight(index);
		}
		else{
			//Ничего не делать
		}
		
	}

	moveZoutAngle(index, eps){
		
		if(!B && !E){
			return ;
		}
		
		if(!this.isAngle(index, eps)){
			return ;
		}

		let [B, C, D, E] = this.subarr(index-1, 4);
		//CD || z
		
		if(!B){
			this.moveZtoMiddleRight(index);
		}
		else if(!E){
			this.moveZtoMiddleLeft(index);
		}
		else{
			if(wasLongest([B, C], [D, E])>=0){
				//toBC
				this.moveZtoMiddleLeft(index);
			}
			else{
				this.moveZtoMiddleLeft(index);
			}
		}
		
	}

	joinCollinears(eps){
		let i = this.length;
		for(;i--;){
			if(!this[i].skew && this.isCollinear(i, eps)){
				this.splice(i, 1);
			}
		}
	}
	
	moveAllZtoAngle(eps){
		let i = this.length;
		for(;i--;){
			if(this.isZ(i)){
				this.moveZtoAngle(i, eps);
			}
		}
	}
	
	moveAllZoutAngle(eps){
		let i = this.length;
		for(;i--;){
			if(this.isZ(i)){
				this.moveZoutAngle(i, eps);
			}
		}
	}
	
	
	splitByLevels(){
		const parts = [];
		const color = this.color;
		
		let part, level;
		
		for(let point of this){
			if(level !== point.z){
				part = new LayeredComponent();
				part.color = color;
				level = point.z;
				parts.push(part);
			}
			part.push(point);
		}
		
		let first = parts[0];
		if(this.closed && first[0].z === part[0].z){
			parts.pop();
			parts[0] = part.concat(first);
		}
		else{
			if(this.ended){
				part.ended = true;
			}
			if(this.started){
				parts[0].started = true;
			}
		}
		
		//console.log(levels.map(level=>level.map(part=>expandEnds(part, 1))));
		return parts;
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
	
	
	renderToSCAD(){
		//console.log(this.edges());
		let body = 
			this.edges().map(([p1, p2])=>(`edge([${p1.join(',')}],[${p2.join(',')}]);`))
			.concat(this.map((p)=>(`point([${p.join(',')}]);`)))
			.join('\n');
		
		if(this.color){
			return `color(${this.color}){
${body}
}`;
		}
		else{
			return body;
		}
	}
}

module.exports = LayeredComponent;