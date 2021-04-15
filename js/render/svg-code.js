const DEFS = `<defs>
	<marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
		<circle cx="5" cy="5" r="5" fill="red" />
    </marker>
</defs>`;

function svg(body, area){
	let [A, B] = area;
	let size = B.sub(A);
	
	let code = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   width="${size.x}mm"
   height="${size.y}mm"
   viewBox="${A.x} ${A.y} ${size.x} ${size.y}"
   version="1.1"
   >

${DEFS}
<g transform="scale(1, -1)">
${body}
</g>
</svg>`;

	return code;
}

function path(d, {color, width, marker}){
	let style = [
		["fill","none"],
		["stroke", color||"#000000"],
		["stroke-width", width||"0.25px"]
	];
	if(marker){
		style.push(
			["marker-mid", "url("+marker+")"]
		);
	}
	
	style = style.map(a=>a.join(':')).join(';');
	let code =`<path
	d="${d}"
	style="${style}"
	/>`;
	
	return code;
}

module.exports = {
	svg,
	path
};

