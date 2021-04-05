const {Vector3, Vector2} = require('@grunmouse/math-vector');
const {svgPart,psPart} = require('../render/index.js');


const {
	intersectMatrix
} = require('../geometry/polyline.js');

const {
	roundedBoldstroke,
	maxRoundRadius	
} = require('../geometry/rounded.js');

const {
	mapOfVectors,
	convertToKeys,
	convertToVectors
} = require('./vector-map.js');

const LayeredComponent = require('./layered-component.js');


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
		return this.components.map(cmp.edges()).flat();
	}
	
	intersect(){
		let lines = this.edges().filter((edge)=>(edge[0].z === edge[1].z));
		let lines2 = lines.map((edge)=>(edge.map(Vector2.from)));
		
		let matrix = intersectMatrix(lines2);
	}
	
	
	assemblyConnectedComponents(components){
		let map = mapOfVectors(this.points());
		let parts = convertToKeys(components);
		let {opened, closed} = sortLines(parts);
		
		opened = opened.map((arr)=>{
			let cmp = LayeredComponent.from(arr.map(convertToVectors));
			cmp.cotrolOrder();
			return cmp;
		});

		closed = closed.map((arr)=>{
			let cmp = LayeredComponent.from(arr.map(convertToVectors));
			cmp.closed = true;
			return cmp;
		});
		
		return new LevelsDiagram(opened.concat(closed));
	}
	
	
	
	rectangleArea(ex){
		ex =  ex || 0;
		let points = this.points();
		let x = points.map(v=>v.x);
		let y = points.map(v=>v.y);
		x.sort((a,b)=>(a-b));
		y.sort((a,b)=>(a-b));
		
		return [
			new Vector2(x[0] -ex, y[0] -ex),
			new Vector2(x.pop() +ex, y.pop()+ex)
		];
	}

	
	render2d(partRender){
		let parts = this.components.map(cmp=>cmp.splitByLevels()).flat();
		
		parts.sort((a,b)=>(a.z-b.z));
		parts = parts.map(part=>part.expandEnds(1));
		
		let code = parts.map(part=>partRender(part));
		
		return code.join('\n');
	}
	
	renderToSVG(width){
		return this.render2d(part=>svgPart(part, width, 'black'));
	}
	
	renderToPS(width){
		return this.render2d(part=>psPart(part, width, '#000000'));
	}
	
	renderToSCAD(width){
		let code = `radius = ${width/2};`;
		
		let comp = this.components.map(a=>a.renderToSCAD()).join('\n');
		
		return code + '\n' + comp;
	}
}

module.exports = LevelsDiagram;