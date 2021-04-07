const {Vector3, Vector2} = require('@grunmouse/math-vector');

const dirmap = require('./dirmap.js');

function TwoLevelDrawer(scale, zscale, code){
	let z = 0;
	let pos = Vector3.O();
	let drawing = false;
	let append = false;
	let components = [];
	
	let tockens = code.toLowerCase().split(/\s+/g);
	let len = tockens.length;
	
	
}