const {delta, boldstroke, expandEnds} = require('./polyline.js');
const {roundedBoldstroke, maxRoundRadius} = require('./rounded.js');

function psPolyline(points, close){
	let start = points[0];
	let steps = points.slice(1);


	let code = 
		(close ? 'newpath\n' : '') +
		[start[0], start[1], 'moveto'].join(' ') + '\n' +
		steps.map((v, i)=>{
			if(v.radius){
				
				let next = steps[i+1] || start;
				return [v[0], v[1], next[0], next[1], v.radius, 'arct'].join(' ');
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
		let R = color.slice(1,3);
		let G = color.slice(3,5);
		let B = color.slice(5,7);
		
		let code = [R, G, B].map((hex)=>(parseInt(hex, 16)/255));
		code.push('setrgbcolor');
		
		return code.join(' ');
	}
	else{
		throw new Error('Unknown ps color ' + color);
	}
}

function psPart(part, width, strokeColor){
	let flatPart = part.map(v=>v.cut(2));
	maxRoundRadius(flatPart, 1);

	let form = psBold(flatPart, width, part.started, part.ended);
	let fillColor = part.color || '#FFFFFF';
	strokeColor = strokeColor || '#000000';
	
	let code = psColor(fillColor) + '\n' + form.fill + '\nfill' + '\n'
		+ psColor(strokeColor) + '\n' + form.stroke + '\nstroke';
	
	return code;
}

module.exports = {
	psPart
}