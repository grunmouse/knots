const EightLikeKnot = require('./knots/eight-like-knot.js');
const SimpleLikeKnot = require('./knots/simple-like-knot.js');

const {
	Segment,
	functions
} = require('@grunmouse/cube-bezier');

const svg = require('./svg-code.js');

const {Vector2:Vector} = require('@grunmouse/math-vector');

const {
	normalize1
} = require('./preparing.js');

const fsp = require('fs').promises;

function handleKnot(knot){
	
}

function renderKnot(knot){
	let segments = [...knot.segments];
	let points = [].concat(...segments.map(s=>s.points));
	
	let area = functions.rectangleArea(points);
	area = [area[0].add(new Vector(-5,-5)), area[1].add(new Vector(5,5))];
	
	let starts = [knot.nodeA];
	if(knot.loopNode) starts.push(knot.loopNode);
	
	let ds = starts.map(n=>(n.makePath().toSVG()));
	
	let els = ds.map(d=>(svg.path(d, {marker:'#dot'})));
	
	let code = svg.svg(els.join('\n'), area);
	
	return code;
}


async function main(){
	let knot = new EightLikeKnot(new Vector(0,0), 10, 0, 0);
	
	knot.nodeA.segment.toLongAdd(5);
	knot.nodeB.segment.toLongAdd(5);
	
	knot.nodeA.orderSegments();
	knot.loopNode && knot.loopNode.orderSegments();
	
	normalize1(knot.segments, [knot.nodeA, knot.nodeB]);
	
	knot.nodeA = knot.nodeA.actual;
	knot.nodeB = knot.nodeB.actual;
	
	//for(let item of knotA
	
	let code = renderKnot(knot);
	
	return fsp.writeFile('simple_knot.svg', code);
}

main().catch(e=>console.log(e.stack));