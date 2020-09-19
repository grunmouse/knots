
const HalfKnot = require('./half-knot.js');

/**
 * Представляет плетение с несколькими пересечениями концов
 * В зависимости от числа пересечений, состоит из частей AB+CD или AD+BC
 */
class ManyCross{
	constructor(A, D, n, h){
		const AD = D.sub(A);
		const XY = AD.div(n);
		let cross = [];
		let X = A;
		for(let i=0; i<n; ++i){
			let Y = X.add(XY);
			let item = new HalfKnot(X, Y, h);
			cross[i] = item;
			if(i>0){
				let prev = cross[i-1];
				item.nodeA.connect(prev.nodeD);
				item.nodeC.connect(prev.nodeB);
			}
			X=Y;
		}
		
		let last = cross[n-1];
		let first = cross[0];
		
		this.nodeA = first.nodeA;
		this.nodeC = first.nodeC;
		this.nodeB = last.nodeB;
		this.nodeD = last.nodeD;
		
	}
}

module.exports = ManyCross;