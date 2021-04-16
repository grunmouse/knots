const {svg} = require('./svg-code.js');
const {eps} = require('./eps-code.js');
const {scad} = require('./scad-code.js');

const {svgPart, svgPolyline} = require('./svg-render.js');
const {psPart} = require('./ps-render.js');

module.exports = {
	svg,
	eps,
	scad,
	svgPart,
	psPart,
	svgPolyline
};