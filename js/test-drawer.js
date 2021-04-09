const fs = require('fs');
const fsp = fs.promises;

const promisify = require('util').promisify;
const child_process = require('child_process');
const exec = promisify(child_process.exec);

const Drawer = require('./drawer/two-level-drawer.js');

const LevelsDiagram = require('./model/levels-diagram.js');

const {svg, eps, scad} = require('./render/index.js');

const colors = [
	"#FED6BC",
	"#FFFADD",
	"#C3FBD8",
	"#B5F2EA",
	"#C6D8FF"
];

function drawScheme(filename){
	return function(params){
		let code = fs.readFileSync('./knots/'+filename, {encoding:'utf8'});
		let env = Drawer.draw(code, params);

		let knot = new LevelsDiagram(env.components);
		return knot
	}
}


async function main(){
	let knot = drawScheme('scheme1.txt')({a:1});

	knot.addSkewPoints();

	knot.components[0].color = colors[0];
	fs.writeFileSync('exp.scad', scad(knot.renderToSCAD(2)));
	knot.moveAllZoutAngle();
	fs.writeFileSync('exp1.scad', scad(knot.renderToSCAD(2)));

	await fsp.writeFile('exp.eps', eps(knot.renderToPS(2), knot.rectangleArea(5)));
	await exec('epstopdf exp.eps');

}

main().catch(e=>console.log(e.stack));