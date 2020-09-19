const {
	BezierSegment,
	LineSegment,
	Vector
} = require('../base/index.js');

const {
	ManyCross,
	OpenLoop
} = require('../elements/index.js');

class SimpleLikeKnot{
	constructor(A, s, n){
		let map = {
			C:[1,0],
			C1:[1+n],
			B:[2+n],
			D:[1,-1],
			D1:[1+n,-1],
			M:[1,1],
			M1:[1+n,1]
		};
		
		for(let p in map){
			map[p] = new Vector(...map[p]).mul(s).add(A);
		}

		let DM = new OpenLoop(map.D, map.M, s);
		let M1D1 = new OpenLoop(map.M1, map.D1, s);
		
		let MM = new BezierSegment(DM.nodeB, M1D1.nodeA);
		
		let cross = new ManyCross(map.D, map.D1, n, s);
		cross.nodeA.connect(DM.nodeA);
		cross.nodeD.connect(M1D1.nodeB);
		
		let CA = new LineSegment(cross.nodeC, s);
		let CB = new LineSegment(cross.nodeB, s);
		
		let trac = cross.nodeD.trace();
		if(trac.close){
			this.loopNode = trac.start;
		}

		
		this.nodeA = CA.nodeB;
		this.nodeB = CB.nodeB;
	}
}

module.exports = SimpleLikeKnot;