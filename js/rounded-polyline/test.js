
const Drawer = require('./two-level-diagram-drawer.js');

const fsp = require('fs').promises;

const {svg} = require('../svg-code.js');
const {eps} = require('../eps-code.js');

async function main(){
	let knot = new Drawer();
	
		knot.draw(10, `d o 1.5 ho 0.5 no ho s 3 hw nw hw 0.5 w 1.5 f`);
		knot.draw(10, `m n o 5 h d w 1.5 hw 0.5 nw hw s 3 ho no ho 0.5 o 1.5 f`);
		
		knot.components[0].color = "#0000FF";
		//knot.components[1].color = "green";
	

	
	let body = knot.renderToSVG(5);
	
	
	let code = eps(body, knot.rectangleArea(5));
	
	await fsp.writeFile('exp.eps', code);
}

main().catch(err=>console.log(err.stack));