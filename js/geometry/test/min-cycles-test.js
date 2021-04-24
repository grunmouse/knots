const {findMinCicles, pathAngle} = require('../points-graph.js');
const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');
const assert = require('assert');

describe('findMinCicles', ()=>{
	it('sample 1', ()=>{
		const points = [
			new Vector(0,  0), 
			new Vector(2,  0),
			new Vector(4,  0),
			new Vector(5,  0),
			new Vector(5,  2),
			new Vector(4,  2),
			new Vector(2,  2),
			new Vector(2,  0),
			new Vector(2, -1),
			new Vector(4, -1),
			new Vector(4,  0),
			new Vector(4,  2),
			new Vector(4,  3),
		];
		const edges = Array.from({length:points.length-1}, (_, i)=>([points[i], points[i+1]]));
		
		let cycles = findMinCicles(edges);
		
		assert.equal(cycles.length, 4);
		
		console.log(cycles.map(pathAngle));
	});
});