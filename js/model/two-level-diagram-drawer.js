const {Vector3, Vector2} = require('@grunmouse/math-vector');


const TwoLevelDiagram = require('./levels-diagram.js');

const dirmap = require('./dirmap.js');

class TwoLevelDiagramDrawer extends TwoLevelDiagram{
	constructor(){
		super([]);
		this.z = 1;
		this._pos = new Vector3(0,0,1);
		this._append = false;
		this._color = "#FFFFFF";
		this.drawing = false;
	}
	
	production(){
		return new TwoLevelDiagram(this.components);
	}

	get lastComponent(){
		return this.components[this.components.length-1];
	}
	
	/**
	 * Расширить точку хранимым z
	 */
	extPoint(point){
		return new Vector3(point[0], point[1], this.z);
	}
	
	/**
	 * Прибавить x и y точки к последней позиции
	 */
	addPoint(d){
		const prev = this._pos;
		if(!prev){
			throw new Error('Not specified last point');
		}
		return prev.add(new Vector3(d[0], d[1], 0));
	}
	
	/**
	 * Продолжает линию в точку point
	 */
	_line(point){
		if(this._append){
			this.lastComponent.push(point);
		}
		else{
			this.components.push([this._pos, point]);
			this._append = true;
			this.drawing = true;
			this.lastComponent.color = this._color;
		}
		this._pos = point;
	}
	
	color(name){
		if(this._append){
			this.lastComponent.color = name;
		}
		else{
			this._color = name;
		}
	}
	
	/**
	 * Переносит перо в точку point
	 */
	_move(point){
		this._append = false;
		this.drawing = false;
		this._pos = point;
	}
	
	/**
	 * Основной метод абсолютного перемещения пера
	 */
	M(p){
		this._move(this.extPoint(p));
	}
	
	/**
	 * Основной метод относительного перемещения пера
	 */
	m(d){
		this._move(this.addPoint(d));
	}
	
	/**
	 * Основной метод рисования линии по абсолютным координатам
	 */
	L(p){
		this._line(this.extPoint(p));
	}

	/**
	 * Основной метод рисования линии по относительным координатам
	 */
	l(d){
		this._line(this.addPoint(d));
	}
	
	/**
	 * Основной метод смены слоя
	 * В зависимости от состояния, продолжает линию в другой слой, или переносит в него перо
	 */
	level(z){
		if(this.z !== z){
			this.z = z;
			if(this._append){
				this.L(this._pos);
			}
			else{
				this.M(this._pos);
			}
		}
	}

	/**
	 *
	 */
	swap(){
		this.level(1-this.z);
	}	
	
	go(p, h){
		if(this.drawing){
			if(h){
				//console.log('hole', p);
				this.lh(p);
			}
			else{
				//console.log('line', p);
				this.l(p);
			}
		}
		else{
			//console.log('move', p);
			this.m(p);
		}
	}

	hole(point){
		if(point.eq(this._pos)){
			this.swap();
		}
		else{
			let C = this._pos.add(point).div(2);
			this.L(C);
			this.swap();
			this.L(point);
		}
	}
	
	lh(d){
		this.hole(this.addPoint(d));
	}
	Lh(p){
		this.hole(this.extPoint(p));
	}
	
	/**
	 * Заканчивает компонент и помечает его конец как ходовой
	 */
	end(){
		if(this._append){
			this.lastComponent.ended = true;
			this._append = false;
			this.drawing = false;
		}
	}
	
	/**
	 *
	 */
	draw(scale, code){
		if(!code && typeof scale === "string"){
			code = scale;
			scale = 10;
		}
		
		code = code.trim();
		
		if(!code){
			return;
		}
		let tockens = code.toLowerCase().split(/\s+/g);
		let len = tockens.length;
		
		for(let i = 0; i<len; ++i){
			let command = tockens[i];
			let value = tockens[i+1];
			if(command === 'c'){
				++i;
			}
			else if(!isNaN(value)){
				value = Number(value);
				++i;
			}
			else{
				value = 1;
			}
			
			value*=scale;
			
			//console.log(command, value);
			if(command === "p"){
				this.drawing = true;
			}
			else if(command === "m"){
				this.drawing = false;
			}
			else if(command === "c"){
				this.color(value);
			}
			else if(command === "f"){
				this.end();
			}
			else if(command === "h"){
				this.swap();
			}
			else if(command === "x"){
				this.M([value, this._pos.y]);
			}
			else if(command === "y"){
				this.M([this._pos.x, value]);
			}
			else{
				let h = false;
				if(["h", "*"].includes(command[0])){
					h = true;
					command = command.slice(1);
				}
				let v = dirmap[command];
				if(v){
					v = v.mul(value);
					this.go(v, h);
				}
				else{
					throw new Error('no exist dir '+command);
				}
			}
		}
	}

}

module.exports = TwoLevelDiagramDrawer;