const {
	BezierSegment,
	LineSegment,
	Vector
} = require('../base/index.js');

const {
	ManyCross,
	OpenLoop
} = require('../elements/index.js');

class EightLikeKnot{
	constructor(A, s, n, m){
		let map = {
			O1:[1,1],
			O:[1+n,1],
			P:[1,-1],
			C1:[3+n,-2],
			C:[3+n+m, -2],
			B:[3+n+m, 0]
		};
		
		
		for(let p in map){
			map[p] = new Vector(...map[p]).mul(s).add(A);
		}
		
		const PO = new OpenLoop(map.P, map.O1, s);
		const BC = new OpenLoop(map.B, map.C, s);
		
		let nodeO, nodeA;
		if(n===0){
			let BA = new LineSegment(BC.nodeA, (3+n+m)*s);
			nodeO = PO.nodeB;
			nodeA = BA.nodeB;
		}
		else{
			let crossN = new ManyCross(map.O1, map.O, n, -s);
			crossN.nodeA.connect(PO.nodeB);
			let EB = new BezierSegment(crossN.nodeB, BC.nodeA);
			let EA = new LineSegment(crossN.nodeC, s);
			nodeO = crossN.nodeD;
			nodeA = EA.nodeB;
		}
		
		let nodeC, nodeD;
		if(m===0){
			let PD = new LineSegment(PO.nodeA, (3+n+m)*s);
			nodeC = BC.nodeB;
			nodeD = PD.nodeB;
		}
		else{
			let crossM = new ManyCross(map.C1, map.C, m, s);
			crossM.nodeD.connect(BC.nodeB);
			let FD = new LineSegment(crossM.nodeB, s);
			let PF = new BezierSegment(PO.nodeA, crossM.nodeC);
			nodeC = crossM.nodeA;
			nodeD = FD.nodeB;
			
			let trac = crossM.nodeD.trace();
			if(trac.close){
				this.loopNode = trac.start;
			}
		}
		let OC = new BezierSegment(nodeO, 2*s, nodeC, 2*s);

		
		this.nodeA = nodeA;
		this.nodeB = nodeD;
	}
}

module.exports = EightLikeKnot;