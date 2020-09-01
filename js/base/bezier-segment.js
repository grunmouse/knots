const Node = require('./node-of-curve.js');

/**
 * Представляет кубическую кривую Безье из точки A в точку D, с опорными точками B и C
 * позволяет генерировать команду "c" svg-пути, соответствующую кривой AD и DA,
 * позволяет рассчитывать вектора AB и DC, а так же точки, симметричные B и C,
 * для сопряжения с другими узлами
 */
class BezierSegment{
	/**
	 * @param {Vector2} A
	 * @param {Vector2} B
	 * @param {Vector2} C
	 * @param {Vector2} D
	 */
	constructor(A, B, C, D){
		let nodeA, nodeD;
		if(A instanceof Node){
			if(typeof B === 'number'){
			}
			else{
				D = C;
				C = B;
				B = undefined;
			}
			if(A.segment){
				nodeA = A.productNode(0, B);
			}
			else{
				nodeA = A;
			}
			nodeA.segment = this;
			({A, B} = nodeA);
		}
		else{
			nodeA = new Node(A, B, this);
		}
		if(C instanceof Node){
			if(C.segment){
				nodeD = C.productNode(0, D);
			}
			else{
				nodeD = C;
			}
			nodeD.segment = this;
			({A:D, B:C} = nodeD);
		}
		else{
			nodeD = new Node(D, C, this);
		}
		
		this.points = [A,B,C,D];
		
		this.nodeA = nodeA;
		this.nodeD = nodeD;
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