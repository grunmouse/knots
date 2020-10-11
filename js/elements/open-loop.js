const {
	Segment
} = require('@grunmouse/cube-bezier');

/**
 * Открытая петля
 */

class OpenLoop{
	constructor(O, Q, h){
		const I = Q.sub(O).ort();
		const J = I.rotOrto(1);
		const bot = J.mul(h);
		const P = O.add(Q).div(2).add(bot);
		
		const M = O.add(bot);
		const N = M.add(P).div(2);
		
		let OP = Segment.makeCubic(O, M, N, P);
		let PQ = Segment.makeCubic(OP.nodeB, Q.add(bot), Q);
		
		this.nodeA = OP.nodeA;
		this.nodeB = PQ.nodeB;
		
		this.segments = new Set([OP, PQ]);
	}
}

module.exports = OpenLoop;