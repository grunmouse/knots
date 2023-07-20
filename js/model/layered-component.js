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
	
	/**
	 * Является ли ребро вертикальным
	 * @param index - номер первой точки ребра
	 */
	isZ(index){
		let [A, B] = this.subarr(index, 2);
		return !!A && !!B && A.x === B.x && A.y === B.y && A.z !== B.z;
	}
	
	/**
	 * Является ли ребро горизонтальным (лежит в плане)
	 * @param index - номер первой точки ребра
	 */
	isXY(index){
		let [A, B] = this.subarr(index, 2);
		return !!A && !!B && A.z === B.z;
	}
	
	/**
	 * Является ли точка вершиной угла на плане
	 * @param index - номер точки
	 * @param eps - допуск коллинеарности
	 */
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
	
	/**
	 * Перемещает вертикальное ребро на полребра вправо, создаёт новое ребро
	 * @param index - номер первой точки перемещаемого ребра
	 */
	moveZtoMiddleRight(index){
		let [A, B, C] = this.subarr(index, 3);
		//AB || Oz ; BC || xOy
		let D = B.add(C).div(2);
		let E = new Vector3(D.x, D.y, A.z);
		//ED || Oz
		//[A, E, D, C]; 
		this.esplice(index+1, 1, E, D);
	}
	
	/**
	 * Перемещает вертикальное ребро на полребра влево, создаёт новое ребро
	 * @param index - номер первой точки перемещаемого ребра
	 */
	moveZtoMiddleLeft(index){
		let [A, B, C] = this.subarr(index-1, 3);
		//BC || Oz ; AB || xOy
		let D = B.add(A).div(2);
		let E = new Vector3(D.x, D.y, C.z);
		//DE || Oz 
		//[A, D, E, C]
		this.esplice(index, 1, D, E);
	}

	/**
	 * Перемещает вертикальное ребро на ребро влево
	 * @param index - номер первой точки перемещаемого ребра
	 */
	moveZtoLeft(index){
		let [A, B, C, D] = this.subarr(index-1, 4);
		//BC || z
		let E = new Vector3(A.x, A.y, C.z);
		//AE || z
		//[A, E, C, D]
		this.esplice(index, 1, E);
	}

	/**
	 * Перемещает вертикальное ребро на ребро вправо
	 * @param index - номер первой точки перемещаемого ребра
	 */
	moveZtoRight(index){
		let [A, B, C, D] = this.subarr(index-1, 4);
		//BC || z
		let E = new Vector3(D.x, D.y, B.z);
		//ED || z
		//[A, B, E, D]
		this.esplice(index+1, 1, E);
	}
	
	/**
	 * Передвинуть вертикальное ребро в угол
	 * @param index - первая точка ребра
	 * @param eps - допуск коллинеарности
	 */
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

	/**
	 * Убрать ребро из угла
	 * @param index - первая точка ребра
	 * @param eps - допуск коллинеарности
	 */
	moveZoutAngle(index, eps){
		if(!this.isAngle(index, eps)){
			return ;
		}

		let [B, C, D, E] = this.subarr(index-1, 4);

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

	/**
	 * Объёдинить коллинеарные рёбра
	 */
	joinCollinears(eps){
		let i = this.length;
		for(;i--;){
			if(!this[i].skew && this.isCollinear(i, eps)){
				this.splice(i, 1);
			}
		}
		return this;
	}
	
	/**
	 * Передвинуть все вертикальные рёбра в углы
	 */
	moveAllZtoAngle(eps){
		let i = this.length;
		for(;i--;){
			if(this.isZ(i)){
				this.moveZtoAngle(i, eps);
			}
		}
		return this;
	}
	
	/**
	 * Передвинуть все ввертикальные рёбра из углов
	 */
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
		const width = this.width;
		
		let part, level;
		
		for(let point of this){
			if(level !== point.z){
				level = point.z;
				part = new FlatPart();
				part.color = color;
				part.width = width;
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
	
	/**
	 * Вертикальные рёбра
	 */
	hedges(){
		return this.edges().filter(({A, B})=>(A.z === B.z));
	}
	
	/**
	 * Создаёт новый компонент, масштабируя текущий
	 */
	scale(sxy, sz){
		sxy = sxy || 1;
		sz = sz || 1;
		let result = this.map((vec)=>extendVector(new Vector3(vec.x*sxy, vec.y*sxy, vec.z*sz), vec));
		result.type = this.type;
		result.color = this.color;
		result.width = this.width;
		
		return result;
	}
	
	/**
	 * Перемещает начало координат в новую точку O
	 */
	translate(O){
		return this.emap((vec)=>(vec.sub(O)));
	}
	
	/**
	 * Создаёт новый компонент, отражая текущий по оси z
	 */
	mirrorZ(){
		return this.scale(1,-1);
	}
	
	
	numberSkews(){
		let index = 1;
		for(let i = 0; i<this.length; ++i){
			let point = this[i];
			if(point.skew){
				point.number = index++;
			}
		}
	}
	
	notationDowker(){
		let odd = Map(), even = Map();
		let index = 1;
		for(let i = 0; i<this.length; ++i){
			let point = this[i];
			if(point.skew){
				if(index & 1){
					odd.set(index, point);
				}
				else{
					let number = -index * point.skew; //skew = -1 в случает перехода или 1 в случае прохода
					even.set(point, number);
				}
				++index;
			}
		}
		let pair = [...odd].map(([index, A])=>([index, even.get(A.skewlink)]));
		pair.sort((a, b)=>(a[0] - b[0]));
		return pair.map(a=>(a[1]));
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