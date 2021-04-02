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

function synstividor(n, m){
	
	let ev = n & 1;
	let p =(n-ev)/2
	
	let loop;
	if(ev){
		//перекрестье вверх, потом вниз
		loop = `_o d _o no 
			o ${3+2*m} s 2 w ${2+2*m}
		nw l nw _w d _w`;
	}
	else{
		//вниз, потом наверх
		loop = `l -1 so o ${2+2*m} n 2 w ${3+2*m}`;
	}

	let code = `
		p o so
		(_o d _o no _o l _o so)[${p}]
		${loop}
		(sw _w l _w nw _w d _w)[${p}]
		sw s o 2 l o ${2*n}
		n *n n f
	`;
		
	code = doRepeat(code);
	
	let knot = new Drawer2();
	knot.draw(10, code);
	
	return knot.production();	
}



module.exports = {stividor};