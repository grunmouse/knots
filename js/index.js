const SimpleOverhandKnot = require('./knots/simple-overhand-knot.js');
const FigureEightKnot = require('./knots/figure-eight-knot.js');
const EightLikeKnot = require('./knots/eight-like-knot.js');
const SimpleLikeKnot = require('./knots/simple-like-knot.js');
const {Vector2} = require('@grunmouse/math-vector');
const fsp = require('fs').promises;

function svg(body){
	let code = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   width="210mm"
   height="297mm"
   viewBox="0 0 210 297"
   version="1.1"
   >
${body}
</svg>`;

	return code;
}

function writeKnot(filepath, knot){
	let path = knot.nodeA.makePath(knot.nodeA.A).toSVG();
	
	let loop;
	if(knot.loopNode){
		loop = knot.loopNode.makePath(knot.loopNode.A).toSVG();
	}
	
	let body = '<g style="fill:none;stroke:#000000;stroke-width:0.292919px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1">'
		+
		`<path d="${path}" />`
		+
		(loop ? `<path d="${loop}" style="stroke:#0000C0"/>` : '')
		+
	'</g>';
	
	
	let code = svg(body);
	
	return fsp.writeFile(filepath, code);
}

async function eightLike(){
	for(let m = 0; m<5; ++m){
		for(let n = 0; n<5; ++n){
			let knot = new EightLikeKnot(new Vector2(10,30), 10, m, n);
			
			await writeKnot('../scheme/eight-like-'+m+'-'+n+'.svg', knot);
		}
	}
}

async function simleLike(){
	for(let n = 1; n<6; ++n){
		let knot = new SimpleLikeKnot(new Vector2(10,30), 10, n);
		
		await writeKnot('../scheme/simple-like-'+n+'.svg', knot);
	}
}


async function main(){

	//await writeKnot('simple_knot.svg', new SimpleOverhandKnot(new Vector2(0,0), 6, 10, 15));
	//await writeKnot('eight_knot.svg', new FigureEightKnot(new Vector2(0,0), 30, 60, 6));
	//let knot = new EightLikeKnot(new Vector2(0,0), 10, 2, 1);
	//await writeKnot('eight_like_knot.svg', knot);
	
	await simleLike();
	await eightLike();
}

main().catch(e=>console.log(e.stack));