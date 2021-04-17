const {
	intersectLinePart,
	isCollinear,
	wasLongest
} = require('../geometry/polyline.js');

const {Vector, Vector2, Vector3} = require('@grunmouse/math-vector');

const extendVector = require('./extend-vector.js');

const Part = require('./part.js');
const FlatPart = require('./flat-part.js');


/**
 * @class LayeredComponent
 * Представляет связную компоненту многослойной диаграммы
 */
class LayeredComponent extends Part {
	
	isZ(index){
		let [A, B] = this.subarr(index, 2);
		return !!A && !!B && A.x === B.x && A.y === B.y && A.z !== B.z;
	}
	
	isXY(index){
		let [A, B] = this.subarr(index, 2);
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
		if(!this.isAngle(index, eps)){
			return ;
		}
		//console.log(this.subarr(index, 2));

		let [B, C, D, E] = this.subarr(index-1, 4);
		//CD || z
		//console.log([B, C, D, E]);
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
				this.moveZtoMiddleRight(index);
			}
		}
	}
	
	moveZoutEnds(){
		if(this.isZ(0)){
			this.moveZtoMiddleRight(0);
		}
		if(this.isZ(this.length-2)){
			this.moveZtoMiddleLeft(this.length-2);
		}
		return this;
	}

	joinCollinears(eps){
		let i = this.length;
		for(;i--;){
			if(!this[i].skew && this.isCollinear(i, eps)){
				this.splice(i, 1);
			}
		}
		return this;
	}
	
	moveAllZtoAngle(eps){
		let i = this.length;
		for(;i--;){
			if(this.isZ(i)){
				this.moveZtoAngle(i, eps);
			}
		}
		return this;
	}
	
	moveAllZoutAngle(eps){
		let i = this.length;
		for(;i--;){
			if(this.isZ(i)){
				this.moveZoutAngle(i, eps);
			}
		}
		return this;
	}
	
	
	splitByLevels(){
		const parts = [];
		const color = this.color;
		
		let part, level;
		
		for(let point of this){
			if(level !== point.z){
				level = point.z;
				part = new FlatPart();
				part.color = color;
				part.z = level;
				parts.push(part);
			}
			part.push(extendVector(point.cut(2), point));
		}
		
		let first = parts[0];
		if(this.closed){
			if(first.z === part.z){
				parts.pop();
				parts[0] = part.concat(first);
			}
		}
		else{
			if(this.ended){
				part.ended = true;
			}
			if(this.started){
				first.started = true;
			}
		}
		
		//console.log(parts);
		//console.log(levels.map(level=>level.map(part=>expandEnds(part, 1))));
		return parts;
	}
	
	hedges(){
		return this.edges().filter(({A, B})=>(A.z === B.z));
	}
	
	/**
	 * Создаёт новый компонент, масштабируя текущий
	 */
	scale(sxy, sz){
		sxy = sxy || 1;
		sz = sz || 1;
		return this.map((vec)=>extendVector(new Vector3(vec.x*sxy, vec.y*sxy, vec.z*sz), vec));
	}
	
	/**
	 * Создаёт новый компонент, отражая текущий по оси z
	 */
	mirrorZ(){
		return this.scale(1,-1);
	}
	
	
	renderToSCAD(){
		let body = 
			this.edges().map(([p1, p2])=>(`edge([${p1.join(',')}],[${p2.join(',')}]);`))
			.concat(this.map((p)=>(`point([${p.join(',')}]);`)))
			.join('\n');
		
		if(this.color){
			return `color("${this.color}"){
${body}
}`;
		}
		else{
			return body;
		}
	}
}

module.exports = LayeredComponent;