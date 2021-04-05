const {Vector3, Vector2} = require('@grunmouse/math-vector');


const LevelsDiagram = require('./levels-diagram.js');
const LayeredComponent = require('./layered-component.js');

const dirmap = require('./dirmap.js');

class MultiLevelDiagramDrawer extends LevelsDiagram{
	constructor(){
		super([]);
		this.z = 0;
		this._pos = new Vector3(0,0,0);
		this._append = false;
		this._color = "#FFFFFF";
		this.drawing = false;
	}
	
	production(){
		return new LevelsDiagram(this.components);
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
			this.components.push(LayeredComponent.from([this._pos, point]));
			this._append = true;
			this.drawing = true;
		}
		this._pos = point;
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
	vertical(dz){
		this.level(this.z+dz);
	}	
	
	go(p, h){
		if(this.drawing){
			//console.log('line', p);
			this.l(p);
		}
		else{
			//console.log('move', p);
			this.m(p);
		}
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

			if(!isNaN(value)){
				value = Number(value);
				++i;
			}
			else{
				value = 1;
			}
			
			
			
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
			else if(command === "l"){
				value*=scale;
				this.vertical(value);
			}			
			else if(command === "d"){
				value*=scale;
				this.vertical(-value);
			}
			else if(command === "x"){
				value*=scale;
				this.M([value, this._pos.y]);
			}
			else if(command === "y"){
				value*=scale;
				this.M([this._pos.x, value]);
			}
			else{
				
				if(command[0] === '_'){
					value /= 2;
				}
				
				let v = dirmap[command];
				if(v){
					value*=scale;
					v = v.mul(value);
					this.go(v);
				}
				else{
					throw new Error('no exist dir '+command);
				}
			}
		}
	}

}

module.exports = MultiLevelDiagramDrawer;