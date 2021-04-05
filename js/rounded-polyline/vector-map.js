const binary = require("@grunmouse/binary");
const {sortLines} = require('../graph-line.js');
const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');

function getKey(vec){
	let buff = new Float64Array.from(vec).buffer;
	
	let value = binary.bigint.fromBuffer(buff);
	
	return value;
}



function joinParamInto(into, name, a, b, callback){
	a = a[name];
	b = b[name];
	callback = callback || ((a, b)=>(a));
	let result;
	if(!a){
		result = b;
	}
	else if(!b){
		result = a;
	}
	else if(a === b){
		result = a;
	}
	else{
		result = callback(a, b);
	}
}

function joinExtVectors(a, b){
	if(a === b){
		return a;
	}
	let result = Vector.from(a);
	joinParamInto(result, 'radius', a, b, Math.min);
	joinParamInto(result, 'starting', a, b, ()=>(false));
	joinParamInto(result, 'ending', a, b, ()=>(false));
	
	return result;
}

function mapOfVectors(vectors){
	const map = new Map();
	for(let a of vectors){
		let key = getKey(a);
		if(map.has(key)){
			let b = map.get(key);
			let v = joinExtVectors(a, b);
			map.set(key, v);
		}
		else{
			map.set(key, a);
		}
	}
	return map;
}

function convertToKeys(arr){
	return arr.map((a)=>{
		if(a instanceof Vector){
			return getKey(a);
		}
		else if(Array.isArray(a)){
			return convertToKey(arr);
		}
		else{
			return a;
		}
	});
}

function convertToVectors(arr, map){
	return arr.map((a)=>{
		if(map.has(a)){
			return map.get(a);
		}
		else if(Array.isArray(a)){
			return convertToVectors(arr, map);
		}
		else{
			return a;
		}
	});
}

module.exports = {
	mapOfVectors,
	convertToKeys,
	convertToVectors,
	getKey,
	joinExtVectors
};