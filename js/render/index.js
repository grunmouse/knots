const {svg} = require('./svg-code.js');
const {eps} = require('./eps-code.js');
const {scad} = require('./scad-code.js');

const {svgPart, svgPolyline, svgElement} = require('./svg-render.js');
const {psPart} = require('./ps-render.js');

module.exports = {
	svg,
	eps,
	scad,
	svgPart,
	svgElement,
	psPart,
	svgPolyline
};