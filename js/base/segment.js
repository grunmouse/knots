const Curve = require('./curve.js');

/**
 * Представляет кубическую кривую Безье, заданную двумя узлами с оттяжками,
 * может интерпретироваться в любом порядке
 */

class Segment{
	constructor(nodeA, nodeB){
		this.nodeA = nodeA;
		this.nodeB = nodeB;
		
		nodeA.segment = this;
		nodeB.segment = this;
		
		this.points = [nodeA.A, nodeA.B, nodeB.B, nodeB.A];
	}
	
	curve(BA){
		let points = this.points.slice(0);
		if(BA){
			points.reverse();
		}
		return new Curve(points);
	}
	
	trace(node, state){
		let fin;
		if(node === this.nodeA){
			fin = this.nodeB;
			state.curves.push(this.curve());
		}
		else if(node === this.nodeB){
			fin = this.nodeA;
			state.curves.push(this.curve(true));
		}
		else{
			throw new Error('Node is not a curves end');
		}
		
		
		if(fin.sibling){
			return fin.sibling.trace(state);
		}
		else{
			state.end = fin;
			return state;
		}
	}	
}


module.exports = Segment;