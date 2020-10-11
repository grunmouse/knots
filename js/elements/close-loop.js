const {
	Segment
} = require('@grunmouse/cube-bezier');

const OpenLoop = require('./open-loop.js');
/**
 * Колышка
 */
class CloseLoop{
	constructor(A, B, w, a){
		let I = B.sub(A).ort();
		let J = B.rotOrto(1);
		let O = B.add(A).div(2); // Центр
		let M = O.sub(J.mul(w/2));
		let N = O.add(J.mul(w/2));
		
		a = a || Math.PI/4;
		
		const MN = new OpenLoop(M, N, B.sub(O).abs());
		
		let V = I.mul(Math.sin(a)).add(J.mul(Math.cos(a))).add(A);
		let W = I.mul(Math.sin(a)).sub(J.mul(Math.cos(a))).add(A);
		
		const AM - Segment.makeCubic(A, W, MN.nodeA);
		const NA - Segment.makeCubic(MN.nodeB, V, A);
		
		this.nodeA = AM.nodeA;
		this.nodeB = NA.nodeD;
		
		this.segments = new Set([...NM.segments, AM, NA])
	}
}