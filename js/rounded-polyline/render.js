const {delta, boldstroke} = require('./polyline.js');

function svgPolyline(points, close){
	let start = points[0];
	let steps = delta(start);
	let code = 'M ' + start.join(",") + ' '
		+ steps.map((v)=>('l ' + v.join(","))).join(' ');
	
	if(close){
		code += ' Z';
	}
	
	return code;
}

/**
 * Генерирует параметры d для фона и границ уширенной ломаной
 * @param points : Array<Vector2> - точки исходной ломаной
 * @param width : Number - ширина ломаной
 * @param isStart : Boolean - закрывать начало
 * @param isEnd : Boolean - закрывать конец
 * @return {Object}
 * @property {fill} - код d для фона
 * @property {stroke} - код d для границы
 */
function svgBold(points, width, isStart, isEnd){
	const {L, R} = boldstroke(points, width/2);
	
	const fill = R.concat(L.slice(0).reverse());
	
	const svgFillPath = svgPolyline(fill, true);
	
	let svgStrokePath;
	
	if(isEnd){
		const stroke = fill;
		svgStrokePath = svgPolyline(stroke, isStart);
	}
	else if(isStart){
		const stroke = R.slice(0).reverse().concat(L);
		svgStrokePath = svgPolyline(stroke, false);
	}
	else{
		svgStrokePath = svgPolyline(R, false) + ' ' + svgPolyline(L, false);
	}
	
	return {
		fill: svgFillPath,
		stroke: svgStrokePath
	}
}