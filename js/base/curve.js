
function bezier(arr, t){
	let res = [];
	for(let i=1, len = arr.length; i<len; ++i){
		res[i-1] = arr[i-1].mul(1-t).add(arr[i].mul(t));
	}
	return res;
}

/**
 * Представляет кривую безье, заданную точками, которую можно отрисовать в разных форматах
 */
class Curve{
	constructor(points){
		this.points = points;
	}

	relativeCDR(){
		let [car, ...cdr] = this.points;
		return cdr.map((item)=>(item.sub(car)));
	}
	
	getPoint(t){
		return bezier(bezier(bezier(this.points, t), t), t);
	}
	
}

module.exports = Curve;