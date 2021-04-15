const {
	delta, 
	boldstroke,
	isosceles,
	isoradial,
	deltoid
} = require('../geometry/polyline.js');
const {roundedBoldstroke, maxRoundRadius} = require('../geometry/rounded.js');

const {Vector3, Vector2} = require('@grunmouse/math-vector');


function lineto(v){
	//console.log(v);
	return `L ${v.x} ${v.y}`;
}

/**
 * Генерирует команды l и a
 */
function arct(A, B, C, r){

	let [M, D, N] = isoradial(A, B, C, r); //Отсекаем отрезки нужной длины
	//let O = deltoid(M, D, N); //Находим центр дуги
	let result = [];
	if(A.ne(M)){
		result.push(lineto(M));
	}
	let signA = B.sub(A).cross(C.sub(B));
	let sweep = signA < 0 ? 1 : 0;
	result.push(`A ${r} ${r} 0 0 ${sweep} ${N.x} ${N.y}`);
	
	return result.join(' ');
}

function svgPolyline(points, close){
	let start = points[0];
	let steps = points.slice(1);

	let code = 'M ' + start.cut(2).join(",") + ' '
		+ steps.map((v, i)=>{
			if(v.radius){
				let prev = points[i];
				let next = steps[i+1] || start;
				return arct(prev, v, next, v.radius);
			}
			else{
				return lineto(v);
			}
		}).join(' ');
	
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
	const {L, R} = roundedBoldstroke(points, width/2);
	
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

function svgPart(part, width, strokeColor){
	
	let form = svgBold(part, width, part.started, part.ended);
	let fillColor = part.color || '#FFFFFF';
	strokeColor = strokeColor || '#000000';
	
	return `<path d="${form.fill}" fill="${fillColor}" stroke="none" />
<path d="${form.stroke}" fill="none" stroke="${strokeColor}" style="stroke-width:0.25" />`;
}

module.exports = {svgBold, svgPart};