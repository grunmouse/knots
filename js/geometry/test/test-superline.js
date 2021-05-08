const fs = require('fs');

const {
	svg,
	svgPart,
	svgPolyline,
	svgElement
} = require('../../render/index.js');

const {
	convertRounded,
	cutLineBySeg,
	convertLineFromSeg
} = require('../superline.js');

const {Vector2} = require('@grunmouse/math-vector');

let points = [
	new Vector2(0,0),
	new Vector2(20, 20),
	new Vector2(40, 0)
];

points[1].radius = 5

let items = convertRounded(points);

console.log(items);

let lines = [
	[new Vector2(0, 0), new Vector2(60,0)],
	[new Vector2(0, 2), new Vector2(60,2)],
	[new Vector2(0, -2), new Vector2(60,-2)],
	[new Vector2(0, -2), new Vector2(40,2)],
	[new Vector2(10, -2), new Vector2(10,2)],
	[new Vector2(28, -2), new Vector2(28,2)],
	[new Vector2(50, -2), new Vector2(50,2)],
];

let area = [new Vector2(-5,-5), new Vector2(65, 25)];

function makeFigures(items, lines){
	let result = [];
	for(let line of lines){
		for(let seg of items){
			let cuted = cutLineBySeg(line, seg);
			if(!cuted.empty){
				let part = cuted.part;
				let fig = convertLineFromSeg(part, seg);
				result.push(fig);
			}
		}
	}
	return result;
}

function makePath(el){
	let path = svgElement(el);
	return `<path stroke="black" fill="none" style="stroke-width:0.25" d="${path}" />`;
}

function render(elements, area){
	
	let body = elements.map(makePath).join('\n');

	return svg(body, area);
}

let elements = makeFigures(items, lines);

fs.writeFileSync('exp.svg', render(elements, area));