const {
	BezierSegment
} = require('@grunmouse/cube-bezier');

/** 
 * Полуузел
 * Состоит из двух пересекающихся сегментов AB и CD
 */
class HalfKnot{
	constructor(A, D, h){
		const AD = D.sub(A);
		const I = AD.ort();
		const J = I.rotOrto(1);
		const AC = J.mul(h);
		const AB = AD.add(AC);
		
		const B = A.add(AB);
		const C = A.add(AC);
		
		const M = A.add(D).div(2);
		const N = C.add(B).div(2);
		
		const P = N;
		const Q = M;
		
		const segAB = new BezierSegment(A, M, N, B);
		const segCD = new BezierSegment(C, P, Q, D);
		
		this.nodeA = segAB.nodeA;
		this.nodeB = segAB.nodeB;

		this.nodeC = segCD.nodeA;
		this.nodeD = segCD.nodeB;
		
		this.segAB = segAB;
		this.segCD = segCD;
	}
	
	
}

module.exports = HalfKnot;