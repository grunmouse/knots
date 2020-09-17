const {
	BezierSegment,
	LineSegment,
	Vector
} = require('../base/index.js');

const {
	HalfKnot,
	OpenLoop
} = require('../elements/index.js');

class FigureEightKnot{
	constructor(A, h, w, s){
		let a = h/2;
		const AO = new Vector(a,s);
		
		const O = A.add(AO);
		const P = O.add(new Vector(0, -h));
		const B = A.add(new Vector(w-a, 0));
		const C = B.add(new Vector(0, -h));
		const D = C.add(AO);
		const M = A.add(D).div(2);

		const BC = new OpenLoop(B, C, a);
		const PO = new OpenLoop(P, O, a);
		
		const OC = new BezierSegment(PO.nodeB, BC.nodeB);
		
		const BA = new LineSegment(BC.nodeA, w-a);
		const PD = new LineSegment(PO.nodeA, w-a);
		
		console.log(PO.nodeA);
		console.log(PD.nodeA);
		
		this.nodeA = BA.nodeB;
		this.nodeD = PD.nodeB;
	}
}

module.exports = FigureEightKnot;