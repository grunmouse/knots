const EightLikeKnot = require('./knots/eight-like-knot.js');
const SimpleLikeKnot = require('./knots/simple-like-knot.js');

const {
	LineSegment,
	BezierSegment
} = require('@grunmouse/cube-bezier');

const {Vector2:Vector} = require('@grunmouse/math-vector');

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
	
	let start=new LineSegment(knot.nodeA, 5);
	new LineSegment(knot.nodeB, 5);
	let path = start.nodeB.makePath(start.nodeB.A).toSVG();
	
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
	
	//return fsp.writeFile(filepath, code);
}

async function eightLike(){
	for(let m = 0; m<5; ++m){
		for(let n = 0; n<5; ++n){
			let knot = new EightLikeKnot(new Vector(10,30), 10, m, n);
			
			await writeKnot('../scheme/eight-like-'+m+'-'+n+'.svg', knot);
		}
	}
}

async function simpleLike(){
	for(let n = 1; n<6; ++n){
		let knot = new SimpleLikeKnot(new Vector(10,30), 10, n);
		
		await writeKnot('../scheme/simple-like-'+n+'.svg', knot);
	}
}


async function main(){

	await simpleLike();
	await eightLike();
}

main().catch(e=>console.log(e.stack));