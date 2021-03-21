
const Drawer = require('./rounded-polyline/two-level-diagram-drawer.js');

const fsp = require('fs').promises;

const {svg} = require('./svg-code.js');

const colors = [
	"#FED6BC",
	"#FFFADD",
	"#C3FBD8",
	"#B5F2EA",
	"#C6D8FF"
];


function simpleKnot(n){
	let knot = new Drawer();
	
	let code = [
		"d o *o 0.5 no ",
		"*o 0.5 so *o 0.5 no ".repeat(n),
		"*o s 2 ",
		"*w " + (3 + n*3),
		"n 2 *o so ",
		"*o 0.5 no *o 0.5 so ".repeat(n),
		"*o 0.5 o f "
	].join(' ');
	knot.draw(10, code);
	
	knot.components[0].color = colors[0];
	
	return svg(knot.renderToSVG(2), knot.rectangleArea(5));
}

async function main(){
	await fsp.writeFile('exp.svg', simpleKnot(5));
}

main().catch(e=>console.log(e.stack));