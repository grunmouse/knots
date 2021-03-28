const {delta, boldstroke} = require('./polyline.js');
const {roundedBoldstroke} = require('./rounded.js');

function psPolyline(points, close){
	let start = points[0];
	let steps = points.slice(1);


	let code = 
		(close ? 'newpath\n' : '') +
		[start[0], start[1], 'moveto'].join(' ') + '\n' +
		steps.map((v, i)=>{
			if(v.radius){
				let next = steps[i+1] || start;
				return [v.radius, v[0], v[1], next[0], next[1], 'arcto'].join(' ');
			}
			else{
				return [v[0], v[1], 'lineto'].join(' ');
			}
		}).join('\n');
		
	if(close){
		code += '\nclosepath';
	}
	return code;
}

function psBold(points, width, isStart, isEnd){
	const {L, R} = roundedBoldstroke(points, width/2);
	
	const fill = R.concat(L.slice(0).reverse());
	
	const codeFill = psPolyline(fill, true);
	
	let psStroke;
	
	if(isEnd){
		const stroke = fill;
		psStroke = psPolyline(stroke, isStart);
	}
	else if(isStart){
		const stroke = R.slice(0).reverse().concat(L);
		psStroke = psPolyline(stroke, false);
	}
	else{
		psStroke = psPolyline(R, false) + '\n' + psPolyline(L, false);
	}
	
	return {
		fill: codeFill,
		stroke: psStroke
	}
}

function psColor(color){
	if(color[0]==='#'){
		let R = '16#' + color.slice(1,3);
		let G = '16#' + color.slice(3,5);
		let B = '16#' + color.slice(5,7);
		
		return [R, G, B, 'setrgbcolor'].join(' ');
	}
	else{
		throw new Error('Unknown ps color ' + color);
	}
}

function psPart(part, width, strokeColor){
	let form = psBold(part.map(v=>v.cut(2)), width, part.started, part.ended);
	let fillColor = part.color || '#FFFFFF';
	strokeColor = strokeColor || '#000000';
	
	let code = psColor(fillColor) + '\n' + form.fill + '\nfill' + '\n'
		+ psColor(strokeColor) + '\n' + form.stroke + '\nstroke';
	
	return code;
}

module.exports = {
	psPart
}