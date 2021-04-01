const Drawer = require('../rounded-polyline/two-level-diagram-drawer.js');
const Drawer2 = require('../rounded-polyline/multi-level-diagram-drawer.js');

function doRepeat(str){
	return str.replace(/\(([^)]*)\)\[(\d+)\]/g, (str, item, n)=>{
		return new Array(+n).fill(item).join(" ");
	});
}

function stividor(n){
	
	let ev = n & 1;
	let p =(n-ev)/2
	
	let loop;
	if(ev){
		loop = `*o no *o o *s w *w nw *w`;
	}
	else{
		loop = `*o o *n w *w`;
	}

	let code = `
		p o so
		(*o no *o so)[${p}]
		${loop}
		(sw *w nw *w)[${p}]
		sw s *o ${2+2*n}
		n *n n f
	`;
		
	code = doRepeat(code);
	
	let knot = new Drawer();
	knot.draw(10, code);
	
	return knot.production();	
}

module.exports = {stividor};