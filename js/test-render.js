const fsp = require('fs').promises;

const {svg, eps, scad} = require('./render/index.js');



const {
	use,
	compile
} = require('@grunmouse/format-recursive');

const {
	simpleKnot,
	simpleKnot2,
	doubleSimpleKnot
} = require('./knots/simple-blood.js');


async function main(){
	let knot = simpleKnot2(2);
	
	await fsp.writeFile('exp.scad', scad(knot.renderToSCAD(2)));
	await fsp.writeFile('exp.svg', svg(knot.renderToSVG(2), knot.rectangleArea(5)));
	await fsp.writeFile('exp.eps', eps(knot.renderToPS(2), knot.rectangleArea(5)));

}

main().catch(e=>console.log(e.stack));