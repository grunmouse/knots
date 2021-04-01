const {
	delta,
	onedistanceABC,
	boldstroke
} = require('./polyline.js');

function roundedBoldstroke(points, s){
	const {L, R} = boldstroke(points, s);
	
	points.forEach((B, i)=>{
		if(B.radius){
			let A = points[i-1];
			let C = points[i+1];
			let AB = B.sub(A);
			let BC = C.sub(B);
			let rot = AB.cross(BC);
			if(rot<0){
				//левый поворот
				L[i].radius = B.radius - s;
				R[i].radius = B.radius + s;
			}
			else if(rot>0){
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

function maxRoundRadius(points, ex){
	ex = ex || 0;
	let R = [];
	
	let d = delta(points);
	
	//function
	
	function setZero(_, i){
		if(!isNaN(R[i])){
			return R[i];
		}
		let A = points[i-1];
		let C = points[i+1];
		if(!A || !C){
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
	}
	
	function calcR(_, i){
		if(!isNaN(R[i])){
			return R[i];
		}
		let A = points[i-1];
		let C = points[i+1];
		if(!A || !C){
			R[i] = 0;
			return R[i];
		}
		let B = points[i];
		let AB = B.sub(A);
		let BC = C.sub(B);		
		let a = AB.abs();
		let b = BC.abs();
		
		let r = onedistanceABC(A, B, C);
		
		let s = Math.min(R[i-1] === 0 ? a-ex : a/2, R[i+1] === 0 ? b-ex : b/2);
		
		
		R[i] = s /Math.sqrt(r.abs()**2 - 1);
		
		
		return R[i];
	}
	
	points.forEach(setZero);
	points.forEach(calcR);
	
	points.forEach((p, i)=>{p.radius = R[i]});
	
	return R;
	
}

module.exports = {
	roundedBoldstroke,
	maxRoundRadius
}