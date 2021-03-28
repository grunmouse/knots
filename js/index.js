
const Drawer = require('./rounded-polyline/two-level-diagram-drawer.js');

const fsp = require('fs').promises;

const {svg} = require('./svg-code.js');
const {eps} = require('./eps-code.js');

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

function doRender(knot){
	knot.components.forEach((cmp, i)=>{cmp.color = colors[i]});
	
	return eps(knot.renderToPS(2), knot.rectangleArea(5));
}


async function main(){
	await fsp.writeFile('../tex/knots/images/simple.eps', doRender(simpleKnot(0)));
	await fsp.writeFile('../tex/knots/images/blood-1.eps', doRender(simpleKnot(1)));
	await fsp.writeFile('../tex/knots/images/blood-2.eps', doRender(simpleKnot(2)));
	await fsp.writeFile('../tex/knots/images/simple-v2.eps', doRender(simpleKnot2(0)));
	await fsp.writeFile('../tex/knots/images/blood-1-v2.eps', doRender(simpleKnot2(1)));
	await fsp.writeFile('../tex/knots/images/double-simple-1-1.eps', doRender(doubleSimpleKnot(1,1)));
	await fsp.writeFile('../tex/knots/images/double-simple-2-2.eps', doRender(doubleSimpleKnot(2,2)));
	await fsp.writeFile('../tex/knots/images/double-simple-3-3.eps', doRender(doubleSimpleKnot(3,3)));
}

main().catch(e=>console.log(e.stack));