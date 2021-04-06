const {
	intersectMatrix,
	isInPart,
	intersectLinePart
} = require('../polyline.js');

const {Vector2} =require('@grunmouse/math-vector');
const assert = require('assert');

describe('polyline', ()=>{
	describe('isInPart', ()=>{
		it('1', ()=>{
			assert.ok(isInPart(new Vector2(60, 0), [new Vector2(0,0), new Vector2(65,0)]));
		});
		it('2', ()=>{
			assert.ok(isInPart(new Vector2(60, 0), [new Vector2(60,-20), new Vector2(65,0)]));
		});
		it('3', ()=>{
			assert.ok(isInPart(new Vector2(40, 0), [new Vector2(0,0), new Vector2(65,0)]));
		});
		it('4', ()=>{
			assert.ok(isInPart(new Vector2(40, 0), [new Vector2(40,-20), new Vector2(40,10)]));
		});
		it('5', ()=>{
			assert.ok(isInPart(new Vector2(70, -10), [new Vector2(70,0), new Vector2(70,-20)]));
		});
		it('6', ()=>{
			assert.ok(isInPart(new Vector2(70, -10), [new Vector2(15,-10), new Vector2(80,-10)]));
		});

	});
	
	describe('intersectLinePart', ()=>{
		let lines = [
		  [ new Vector2(0, 0), new Vector2(65, 0) ],
		  [ new Vector2(65, 0), new Vector2(70, 0) ],
		  [ new Vector2(70, 0), new Vector2(70, -20) ],
		  [ new Vector2(70, -20), new Vector2(65, -20) ],
		  [ new Vector2(65, -20), new Vector2(60, -20) ],
		  [ new Vector2(60, -20), new Vector2(60, 10) ],
		  [ new Vector2(60, 10), new Vector2(55, 10) ],
		  [ new Vector2(55, 10), new Vector2(50, 10) ],
		  [ new Vector2(50, 10), new Vector2(50, -20) ],
		  [ new Vector2(50, -20), new Vector2(45, -20) ],
		  [ new Vector2(45, -20), new Vector2(40, -20) ],
		  [ new Vector2(40, -20), new Vector2(40, 10) ],
		  [ new Vector2(40, 10), new Vector2(35, 10) ],
		  [ new Vector2(35, 10), new Vector2(30, 10) ],
		  [ new Vector2(30, 10), new Vector2(30, -20) ],
		  [ new Vector2(30, -20), new Vector2(25, -20) ],
		  [ new Vector2(25, -20), new Vector2(20, -20) ],
		  [ new Vector2(20, -20), new Vector2(20, 10) ],
		  [ new Vector2(20, 10), new Vector2(15, 10) ],
		  [ new Vector2(15, 10), new Vector2(10, 10) ],
		  [ new Vector2(10, 10), new Vector2(10, -10) ],
		  [ new Vector2(10, -10), new Vector2(15, -10) ],
		  [ new Vector2(15, -10), new Vector2(80, -10) ]
		];
		
		it('0 5', ()=>{
			assert.ok(intersectLinePart(lines[0], lines[5]));
		});
		it('5 0', ()=>{
			assert.ok(intersectLinePart(lines[5], lines[0]));
		});
	});
		
});