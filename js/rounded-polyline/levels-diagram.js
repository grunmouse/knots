const {Vector3, Vector2} = require('@grunmouse/math-vector');
const {svgPart} = require('./render.js');
const {psPart} = require('./ps-render.js');
const {
	splitByLevels,
	expandEnds,
	intersectMatrix
} = require('./polyline.js');

function splitEdges(arr){
	let result = [], len = arr.length;
	for(let i=1; i<len; ++i){
		result.push([arr[i-1], arr[i]]);
	}
	return result;
}

/**
 * Представляет схему узла в виде трёхмерной ломаной линии, 
 * все звенья которой параллельны либо плоскости xOy, либо оси z
 */
class LevelsDiagram{
	/**
	 * @property components : Array<Vector3>
	 */
	 
	
	constructor(components){
		components = components || [];
		this.components = Array.from(components);
	}
	
	points(){
		return this.components.flat();
	}
	
	edges(){
		return this.components.map(splitEdges).flat();
	}
	
	intersect(){
		let lines = this.edges().filter((edge)=>(edge[0].z === edge[1].z));
		let lines2 = lines.map((edge)=>(edge.map(Vector2.from)));
		
		let matrix = intersectMatrix(lines2);
	}
	
	rectangleArea(ex){
		ex =  ex || 0;
		let points = this.components.flat();
		let x = points.map(v=>v.x);
		let y = points.map(v=>v.y);
		x.sort((a,b)=>(a-b));
		y.sort((a,b)=>(a-b));
		
		return [
			new Vector2(x[0] -ex, y[0] -ex),
			new Vector2(x.pop() +ex, y.pop()+ex)
		];
	}

	renderToSVG(width){
		let parts = this.components.map(splitByLevels).flat();
		parts.sort((a,b)=>(a[0].z-b[0].z));
		parts = parts.map(part=>expandEnds(part, 1));
		
		let code = parts.map(part=>svgPart(part, width, 'black'));
		
		return code.join('\n');
	}
	
	renderToPS(width){
		let parts = this.components.map(splitByLevels).flat();
		parts.sort((a,b)=>(a[0].z-b[0].z));
		parts = parts.map(part=>expandEnds(part, 1));
		
		let code = parts.map(part=>psPart(part, width, '#000000'));
		
		return code.join('\n');
	}
}

module.exports = LevelsDiagram;