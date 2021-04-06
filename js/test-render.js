const fsp = require('fs').promises;

const {svg, eps, scad} = require('./render/index.js');

const promisify = require('util').promisify;
const child_process = require('child_process');
const exec = promisify(child_process.exec);

const {
	use,
	compile
} = require('@grunmouse/format-recursive');

const {
	simpleKnot,
	simpleKnot2,
	doubleSimpleKnot
} = require('./knots/simple-blood.js');

const colors = [
	"#FED6BC",
	"#FFFADD",
	"#C3FBD8",
	"#B5F2EA",
	"#C6D8FF"
];


async function main(){
	let knot = simpleKnot2(2);
	
	knot.addSkewPoints();
	knot.annoteSkews();
	
	knot.components[0].color = colors[0];
	await fsp.writeFile('exp.scad', scad(knot.renderToSCAD(2)));
	await fsp.writeFile('exp.svg', svg(knot.renderToSVG(2), knot.rectangleArea(5)));
	await fsp.writeFile('exp.eps', eps(knot.renderToPS(2), knot.rectangleArea(5)));
	await exec('epstopdf exp.eps');

}

main().catch(e=>console.log(e.stack));