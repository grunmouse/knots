const SimpleOverhandKnot = require('./simple-overhand-knot.js');
const {Vector2} = require('@grunmouse/math-vector');
const fsp = require('fs').promises;

async function main(){
	let knot = new SimpleOverhandKnot(new Vector2(0,0), 6, 10, 15);

	let path = knot.nodeA.startPath(new Vector2(20, 20));

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
	   id="svg993"
	   inkscape:version="1.0 (4035a4fb49, 2020-05-01)"
	   >

	<g style="fill:none;stroke:#000000;stroke-width:0.292919px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1">

		<path
		   d="${path}"
		    />
	</g>

	</svg>`;

	await fsp.writeFile('exp.svg', code);
}

main().catch(e=>console.log(e.stack));