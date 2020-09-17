const Node = require('./node-of-curve.js');

class LineSegment {
	constructor(A, B){
		let nodeA;
		if(A instanceof Node){
			if(A.segment){
				nodeA = A.productNode(0, B);
			}
			else{
				nodeA = A;
			}
			nodeA.segment = this;
			({A, B} = nodeA);
		}
		else{
			nodeA = new Node(A, B, this);
		}
		this.A = A;
		this.B = B;
		
		this.nodeA = nodeA;
		this.nodeB = new Node(B, A, this);
	}
	
	svgAtoB(){
		return 'l ' + this.nodeA.V.join(',');
	}
	svgBtoA(){
		return 'l ' + this.nodeB.V.join(',');
	}
	
	makePath(node){
		let code, next;
		if(node === this.nodeA){
			code = this.svgAtoB();
			next = this.nodeB.sibling;
		}
		else if(node === this.nodeB){
			code = this.svgBtoA();
			next = this.nodeA.sibling;
		}
		
		if(next){
			code += '\n' + next.makePath();
		}
		
		return code;
	}
}

module.exports = LineSegment;