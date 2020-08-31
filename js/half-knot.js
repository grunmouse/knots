const BezierSegment = require('./bezier-segment.js')
const {Vector2} = require('@grunmouse/math-vector');

class HalfKnot{
	constructor(A, h, l, s){
		const B = new Vector2(A.x+l, A.y+h);
		const C = new Vector2(A.x, B.y);
		const D = new Vector2(B.x, A.y);
		const M = new Vector2(A.x+l/2, A.y);
		const N = new Vector2(M.x, B.y);
		
		const segAB = new BezierSegment(A, M, N, B);
		const segCD = new BezierSegment(C, N, M, D);
		
		this.nodeA = segAB.nodeA;
		this.nodeB = segAB.nodeD;

		this.nodeC = segCD.nodeA;
		this.nodeD = segCD.nodeD;
		
		this.segAB = segAB;
		this.segCD = segCD;
	}
	
	
}

module.exports = HalfKnot;