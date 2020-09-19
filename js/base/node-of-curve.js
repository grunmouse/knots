const CurvePath = require('./curve-path.js');


class NodeOfCurve{
	constructor(A, B, segment){
		this.A = A;
		this.B = B;
		this.segment = segment;
	}
	/**
	 * Направляющий вектор касательной к узлу
	 */
	get V(){
		let {A, B} = this;
		return B.sub(A);
	}
	
	/**
	 * Построить вектор, сонаправленный с V, длиной s.
	 * Если s===0 - вернуть V
	 */
	productV(s){
		let d, V = this.V;
		if(s){
			d = V.ort().mul(s);
		}
		else{
			d = V;
		}
		return d;
	}
	
	/**
	 * Создать для узла симметричный сиблинг
	 */
	makeSibling(s){
		let {A, V} = this;
		let B = A.sub(this.productV(s));
		let node = new NodeOfCurve(A, B);
		this.connect(node);
		return node;
	}
	
	/**
	 * Создать новый узел, оттянутый в противоположную сторону и находящийся в точке N
	 * Если N - число, то оно задаёт точку на оси AB
	 */
	mirror(N, s){
		if(typeof N === 'number'){
			N = A.add(this.productV(N));
		}
		let B = N.sub(this.productV(s));
		return new NodeOfCurve(N, B);
	}
	
	connect(node){
		this.sibling = node;
		node.sibling = this;
	}
	
	makePath(start){
		let {startNode, curves, close} = this.trace();
		return new CurvePath(start || startNode.A, curves, close);
	}
	
	get isEnd(){
		return !!this.segment && !this.sibling
	}
	
	trace(state){
		if(!state){
			state = {start:this, curves:[]};
		}
		else if(state.start === this){
			state.close = true;
			return state;
		}
		
		if(this.segment){
			return this.segment.trace(this, state);
		}
		return state;
	}
	
}

module.exports = NodeOfCurve;