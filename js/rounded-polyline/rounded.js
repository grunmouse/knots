const {
	delta,
	onedistanceABC,
	boldstroke
} = require('../polyline.js');

function roundedBoldstroke(points, s){
	const {L, R} = boldstroke(points, s);
	
	points.forEach((B, i)=>{
		if(B.radius){
			let A = points[i-1];
			let C = points[i+1];
			let AB = B.sub(A);
			let BC = C.sub(B);
			let rot = AB.cross(BC);
			if(rot>0){
				//левый поворот
				L[i].radius = B.radius - s;
				R[i].radius = B.radius + s;
			}
			else if(rot<0){
				//правый поворот
				L[i].radius = B.radius + s;
				R[i].radius = B.radius - s;
			}
			else{
				L[i].radius = 0;
				R[i].radius = 0;
			}
		}
	});
	
	return {L, R};
}

function maxRoundRadius(points){
	let prevR = [], postR = [];
	let appR = [];
	let R = [];
	
	let d = delta(points);
	
	//function
	
	function calcR(i){
		if(!isNaN(R[i])){
			return R[i];
		}
		let A = points[i-1];
		let C = points[i+1];
		if(!A || !B){
			R[i] = 0;
			return R[i];
		}
		let B = points[i];
		let AB = B.sub(A);
		let BC = C.sub(B);
		let cosDiff = AB.constructor.cosDiff(AB, BC);
		if(cosDiff > 0.98){
			R[i] = 0;
			return R[i];
		}
		let a = AB.abs();
		let b = BC.abs();
		if(isNaN(R[i-1])){
			a /= 2;
		}
		else{
			a -= R[i-1];
		}
		if(isNaN(R[i+1])){
			b /= 2;
		}
		else{
			b -= R[i+1];
		}
		R[i] = Math.min(a, b);
		return R[i];
	}
	
	points.forEach((B, i)=>{
		calcR(i);
	});
	
}

module.exports = {
	roundedBoldstroke
}