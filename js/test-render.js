const fsp = require('fs').promises;

const {svg, eps, scad} = require('./render/index.js');

const promisify = require('util').promisify;
const child_process = require('child_process');
const exec = promisify(child_process.exec);

const {
	use,
	compile
} = require('@grunmouse/format-recursive');


const Drawer = require('./drawer/multi-level-drawer.js');

const LevelsDiagram = require('./model/levels-diagram.js');

const colors = [
	"#FED6BC",
	"#FFFADD",
	"#C3FBD8",
	"#B5F2EA",
	"#C6D8FF"
];


async function main(){
	let filename = 's-01.txt';
	let code = await fsp.readFile('./knots/'+filename, {encoding:'utf8'});

	let env = Drawer.draw(code, {a:0});

	let knot = new LevelsDiagram(env.components);	

	knot = knot.assemblyConnectedComponents();			
	knot.addSkewPoints();
	knot.moveAllZoutAngle();

	knot = knot.scale(10, 10);
	
	knot.components[0].color = colors[0];
	//await fsp.writeFile('exp.scad', scad(knot.renderToSCAD(2)));
	await fsp.writeFile('exp.svg', svg(knot.renderToSVG(2), knot.rectangleArea(5)));
	//await fsp.writeFile('exp.eps', eps(knot.renderToPS(2), knot.rectangleArea(5)));
	//await exec('epstopdf exp.eps');

}

main().catch(e=>console.log(e.stack));