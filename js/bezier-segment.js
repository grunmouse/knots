const Node = require('./node-of-curve.js');

/**
 * Представляет кубическую кривую Безье из точки A в точку D, с опорными точками B и C
 * позволяет генерировать команду "c" svg-пути, соответствующую кривой AD и DA,
 * позволяет рассчитывать вектора AB и DC, а так же точки, симметричные B и C,
 * для сопряжения с другими узлами
 */
class BezierSegment{
	/**
	 * @param {Vector2} a
	 * @param {Vector2} b
	 * @param {Vector2} c
	 * @param {Vector2} d
	 */
	constructor(a, b, c, d){
		this.points = [a,b,c,d];
		this.A = a;
		this.B = b;
		this.C = c;
		this.D = d;
		
		this.nodeA = new Node(a,b, this);
		this.nodeD = new Node(d,c, this);
	}
	
	reverse(){
		let {A,B,C,D} = this;
		return new this.constructor(D, C, B, A);
	}
	
	/**
	 *
	 */
	get AB(){
		let {A,B} = this;
		return B.sub(A);
	}
	
	get DC(){
		let {C, D} = this;
		return C.sub(D);
	}
	
	/**
	 * Рассчитывает точку, симметричную точке B относительно точки A
	 * Если передана точка N, то преобразует результат в такую систему координат X'Y',
	 * в которой A'=N
	 *
	 * Можно сопрягать кривые: new BezierSegment(A, B, oldSegment.prevA(D), D);
	 */
	prevA(N, s){
		let {A, AB} = this;
		return this._explode(N||A, AB, s);

	}
	
	/**
	 * Рассчитывает точку, симметричную точке C относительно точки D
	 * Если передана точка N, то преобразует результат в такую систему координат X'Y',
	 * в которой D'=N
	 *
	 * Можно сопрягать кривые: new BezierSegment(A, oldSegment.postD(A), C, D);
	 */
	postD(N,s){
		let {D, DC} = this;
		return this._explode(N||D, DC, s);
	}
	
	/**
	 * Находит точку, вычитая из точки N вектор V, если !s, или V.ort().mul(s)
	 */
	_explode(N, V, s){
		let d;
		if(s){
			d = V.ort().mul(s);
		}
		else{
			d = V;
		}
		return N.sub(d);
	}
	
	svgAtoD(){
		let points = this.points.slice(0);
		return this._svgCode(points);
	}

	svgDtoA(){
		let points = this.points.slice(0).reverse();
		return this._svgCode(points);
	}
	
	_svgCode(points){
		let a = points.shift();
		points = points.map((p)=>(p.sub(a)));
		let code = "c " + points.map((p)=>(p.x + ',' +p.y)).join(' ');
		
		return code;
	}
	
	makePath(node){
		let code, next;
		if(node === this.nodeA){
			code = this.svgAtoD();
			next = this.nodeD.sibling;
		}
		else if(node === this.nodeD){
			code = this.svgDtoA();
			next = this.nodeA.sibling;
		}
		
		if(next){
			code += '\n' + next.makePath();
		}
		
		return code;
	}	
}

module.exports = BezierSegment;