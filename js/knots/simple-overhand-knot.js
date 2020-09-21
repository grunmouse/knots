const {
	LineSegment,
	BezierSegment
} = require('@grunmouse/cube-bezier');

const {Vector2:Vector} = require('@grunmouse/math-vector');

const {
	HalfKnot,
	OpenLoop
} = require('../elements/index.js');

class SimpleOverhandKnot{
	constructor(A, h, l, o){
		let AD = new Vector(l, 0);
		let half_knot = new HalfKnot(A, A.add(AD), -h);
		//Размеры полуузла l * h
		//Размеры узла 2l * o
		let center = l/2;
		let left = -l/2;
		let right = l*1.5;
		let middle = (o+h)/2;
		
		let O = new Vector(A.x+left, A.y+middle);
		let Q = new Vector(A.x+right, A.y+middle);
		
		let loop = new OpenLoop(O, Q, o);
		
		let AO = new BezierSegment(half_knot.nodeC, loop.nodeA);
		
		let DQ = new BezierSegment(half_knot.nodeB, loop.nodeB);
		
		this.nodeA = half_knot.nodeA;
		this.nodeB = half_knot.nodeD;
	}
}

module.exports = SimpleOverhandKnot;