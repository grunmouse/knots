const {
	Segment
} = require('@grunmouse/cube-bezier');

const {Vector2:Vector} = require('@grunmouse/math-vector');

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
		
		const segments = [...PO.segments, ...BC.segments];
		
		let nodeO, nodeA;
		if(n===0){
			let BA = Segment.makeLine(BC.nodeA, (3+n+m)*s);
			nodeO = PO.nodeB;
			nodeA = BA.nodeB;
			segments.push(BA);
		}
		else{
			let crossN = new ManyCross(map.O1, map.O, n, -s);
			crossN.nodeA.connect(PO.nodeB);
			let EB = Segment.makeCubic(crossN.nodeB, BC.nodeA);
			let EA = Segment.makeLine(crossN.nodeC, s);
			nodeO = crossN.nodeD;
			nodeA = EA.nodeB;
			segments.push(EB, EA, ...crossN.segments)
		}
		
		let nodeC, nodeD;
		if(m===0){
			let PD = Segment.makeLine(PO.nodeA, (3+n+m)*s);
			nodeC = BC.nodeB;
			nodeD = PD.nodeB;
			segments.push(PD);
		}
		else{
			let crossM = new ManyCross(map.C1, map.C, m, s);
			crossM.nodeD.connect(BC.nodeB);
			let FD = Segment.makeLine(crossM.nodeB, s);
			let PF = Segment.makeCubic(PO.nodeA, crossM.nodeC);
			nodeC = crossM.nodeA;
			nodeD = FD.nodeB;
			
			segments.push(FD, PF, ...crossM.segments);
			let trac = crossM.nodeD.getCurves();
			console.log(trac);
			console.log(trac.end.sibling === trac.start);
			if(trac.close){
				this.loopNode = trac.start;
			}
		}
		let OC = Segment.makeCubic(nodeO, 2*s, nodeC, 2*s);

		segments.push(OC);
		
		this.nodeA = nodeA;
		this.nodeB = nodeD;
		this.segments = new Set(segments);
	}
}

module.exports = EightLikeKnot;