const fsp = require('fs').promises;

const {svg} = require('./svg-code.js');
const {eps} = require('./eps-code.js');
const {scad} = require('./scad-code.js');

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
	
	let code = knot.renderToSCAD(2);
	
	await fsp.writeFile('exp.scad', scad(code));

}

main().catch(e=>console.log(e.stack));