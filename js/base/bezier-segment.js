const Node = require('./node-of-curve.js');
const Segment = require('./segment.js');
/**
 * Представляет кубическую кривую Безье из точки A в точку B, с опорными точками M и N
 * позволяет генерировать команду "c" svg-пути, соответствующую кривой AB и BA,
 */
class BezierSegment extends Segment{
	/*
		Vector2, Vector2, Vector2, Vector2 - кривая по четырём точкам
		Vector2, Vector2, Node, [number]
		Node, [number,] Vector2, Vector2
		Node, [number,] Node, [number] 
	 */
	/**
	 * @param {Vector2} A
	 * @param {Vector2} M
	 * @param {Vector2} N
	 * @param {Vector2} B
	 */
	constructor(A, M, N, B){
		let nodeA, nodeB;
		if(A instanceof Node){
			if(typeof M === 'number'){
			}
			else{
				B = N;
				N = M;
				M = undefined;
			}
			if(A.segment){
				nodeA = A.makeSibling(M);
			}
			else{
				nodeA = A;
			}
		}
		else{
			nodeA = new Node(A, M);
		}
		if(N instanceof Node){
			if(N.segment){
				nodeB = N.makeSibling(B);
			}
			else{
				nodeB = N;
			}
		}
		else{
			nodeB = new Node(B, N);
		}
		
		super(nodeA, nodeB);
	}
	
}

module.exports = BezierSegment;