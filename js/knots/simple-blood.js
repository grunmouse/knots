const Drawer = require('../rounded-polyline/two-level-diagram-drawer.js');
const Drawer2 = require('../rounded-polyline/multi-level-diagram-drawer.js');

function doRepeat(str){
	return str.replace(/\(([^)]*)\)\[(\d+)\]/g, (str, item, n)=>{
		return new Array(+n).fill(item).join(" ");
	});
}

/**
 * Схема 1. Представляет простой узел или кровавый узел
 */
function simpleKnot(n){

	let code = `
		h p o 
		*o 0.5 no
		(*o 0.5 so *o 0.5 no )[${n}]
		*o s 2
		*w ${(3 + n*3)}
		n 2 *o so 
		(*o 0.5 no *o 0.5 so )[${n}]
		*o 0.5 o f
	`;
	
	code = doRepeat(code);
	
	let knot = new Drawer();
	knot.draw(10, code);
	
	return knot.production();
}

/**
 * Вторая форма простого и кровавого узла.
 */
function simpleKnot2(n){
	let code = [
		"p o ", 2+2*n +0.5,
		"l -1 o 0.5 s 2",
		"w 0.5 l 2 w 0.5 n 3",
		"w 0.5 l -2 w 0.5 s 3 w 0.5 l 2 w 0.5 n 3 ".repeat(n),
		"w 0.5 l -2 w 0.5 s 2",
		"o 0.5 l 1 o ", 2 + 2*n +0.5,
		"f"
	].join(' ');

	let knot = new Drawer2();
	
	knot.draw(10, code);
	
	return knot.production();
	
}

/**
 * Схема 2, обобщение
 */
function doubleSimpleKnot(n, m){
	let code = [
		"p",
		(`o ${2*m+n+2} s ${n+1} w ${2*m+n} l 1 w n ${n} `).repeat(n), 
		`n ${n+1}`,
		`o 0.5 l ${-n-2} o 0.5 s ${n+1} o 0.5 l ${n+2} o 0.5 n ${n+1} `.repeat(m),
		"f"
	].join(' ');
	let knot = new Drawer2();
	
	knot.draw(10, code);
	
	return knot.production();
}

module.exports = {
	simpleKnot,
	simpleKnot2,
	doubleSimpleKnot
};