const {
	delta, 
	boldstroke,
	isosceles,
	isoradial,
	deltoid
} = require('../geometry/polyline.js');
const {roundedBoldstroke, maxRoundRadius} = require('../geometry/rounded.js');

const {Vector3, Vector2} = require('@grunmouse/math-vector');


function moveto(v){
	return `M ${v.x} ${v.y}`;
}

function lineto(v){
	return `L ${v.x} ${v.y}`;
}

/**
 * Генерирует команды l и a
 */
function arct(A, B, C, r){

	let [M, D, N] = isoradial(A, B, C, r); //Отсекаем отрезки нужной длины

	let result = [];
	if(A.ne(M)){
		result.push(lineto(M));
	}
	let signA = B.sub(A).cross(C.sub(B));
	let sweep = signA < 0 ? 0 : 1;

	result.push(`A ${r} ${r} 0 0 ${sweep} ${N.x} ${N.y}`);
	
	return result.join(' ');
}

function renderElement(el){
	let {type, fin} = el.fin;
	if(type === 'line'){
		return lineto(fin);
	}
	else if(type === 'curve'){
		let [P0, P1, P2, P3] = el.points;
		return `C ${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${fin.x} ${fin.y}`;
	}
	else if(type === 'arc'){
		let r = el.radius;
		let sweep = el.sign < 0 ? 0 : 1;
		return `A ${r} ${r} 0 0 ${sweep} ${fin.x} ${fin.y}`;
	}
	else if(type === 'move'){
		return moveto(fin);
	}
}

function svgElement(el){
	return moveto(el.start) + ' ' + renderElement(el);
}

function svgElements(els, close){
	let code = moveto(els[0].start) + ' ' + els.map(renderElement).join(' ');
	if(close){
		code += ' Z';
	}
	return code;
}

/**
 * Отрисовывает тег из универсального представления
 */
function svgUPath(els, close, stroke, fill){
	const d = svgElements(els, close);
	
	return `<path d="${d}" fill="${fill}" stroke="${stroke}" />`;
}

function svgPolyline(points, close){
	let start = points[0];
	let steps = points.slice(1);

	let code = moveto(start) + ' '
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
	
	let level = 'level'+part.z;
	
	return `<path d="${form.fill}" fill="${fillColor}" stroke="none" class="${level}-fill"/>
<path d="${form.stroke}" fill="none" stroke="${strokeColor}" style="stroke-width:0.25" class="${level}-stroke"/>`;
}

module.exports = {
	svgBold, 
	svgPart, 
	svgPolyline,
	svgElement,
	svgElements,
	svgUPath
};