
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
	
	let code = [
		"d o *o 0.5 no ",
		"*o 0.5 so *o 0.5 no ".repeat(n),
		"*o s 2 ",
		"*w " + (3 + n*3),
		"n 2 *o so ",
		"*o 0.5 no *o 0.5 so ".repeat(n),
		"*o 0.5 o f "
	].join(' ');
	
	let knot = new Drawer();
	knot.draw(10, code);
	
	knot.components[0].color = colors[0];
	
	return svg(knot.renderToSVG(2), knot.rectangleArea(5));
}

function simpleKnot2(n){
	let code = [
		"d o *o",
		"*o *o ".repeat(n),
		"o s 2",
		"*w n 3",
		"*w s 3 *w n 3 ".repeat(n),
		"*w s 2 o",
		"*o *o ".repeat(n),
		"*o o f"
	].join(' ');

	let knot = new Drawer();
	//knot.swap();
	knot.draw(5, code);
	
	knot.components[0].color = colors[0];
	
	return svg(knot.renderToSVG(2), knot.rectangleArea(5));
}

async function main(){
	await fsp.writeFile('exp.svg', simpleKnot2(2));
}

main().catch(e=>console.log(e.stack));