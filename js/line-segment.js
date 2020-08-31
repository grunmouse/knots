const Node = require('./node-of-curve.js');

class LineSegment {
	constructor(A, B){
		this.A = A;
		this.B = B;
		
		this.nodeA = new Node(A, B, this);
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
		
		return path;
	}
}

module.exports = LineSegment;