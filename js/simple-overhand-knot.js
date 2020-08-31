const BezierSegment = require('./bezier-segment.js');
const LineSegment = require('./line-segment.js');
const HalfKnot = require('./half-knot.js');
const {Vector2} = require('@grunmouse/math-vector');

class SimpleOverhandKnot{
	constructor(A, h, l, o){
		let half_knot = new HalfKnot(A, h, l);
		//Размеры полуузла l * h
		//Размеры узла 2l * o
		let center = l/2;
		let left = -l/2;
		let right = l*1.5;
		let middle = o/2;
		
		let O = new Vector2(A.x+left, A.y+middle);
		let P = new Vector2(A.x+center, A.y+o);
		let Q = new Vector2(A.x+right, A.y+middle);
		
		let OP = new BezierSegment(O, new Vector2(O.x, P.y), new Vector2(A.x, P.y), P);
		let PQ = new BezierSegment(P, OP.nodeD.product(P), new Vector2(Q.x, P.y), Q);
		OP.nodeD.connect(PQ.nodeA);
		
		let AO = new BezierSegment(A, half_knot.nodeA.product(), OP.nodeA.product(O), O);
		half_knot.nodeA.connect(AO.nodeA);
		AO.nodeD.connect(OP.nodeA);
		
		let DQ = new BezierSegment(half_knot.nodeD.A, half_knot.nodeD.product(), PQ.nodeD.product(), PQ.nodeD.A);
		half_knot.nodeD.connect(DQ.nodeA);
		DQ.nodeD.connect(PQ.nodeD);
		
		this.nodeA = half_knot.nodeC;
		this.nodeB = half_knot.nodeB;
	}
}

module.exports = SimpleOverhandKnot;