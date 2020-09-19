const Node = require('./node-of-curve.js');
const Segment = require('./segment.js');

class LineSegment extends Segment{
	constructor(A, B){
		let nodeA;
		if(A instanceof Node){
			if(A.segment){
				nodeA = A.makeSibling(B);
			}
			else{
				nodeA = A;
			}
		}
		else{
			nodeA = new Node(A, B);
		}
		
		let nodeB = nodeA.mirror(nodeA.B);
		
		super(nodeA, nodeB);
	}

}

module.exports = LineSegment;