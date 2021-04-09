const {Vector3, Vector2} = require('@grunmouse/math-vector');

const {MapOfSet} = require('@grunmouse/special-map');

const {
	intersectMatrix,
	intersectLinePart,
	sorterByDirection
} = require('../geometry/polyline.js');


const {
	mapOfVectors,
	convertToKeys,
	convertToVectors
} = require('./vector-map.js');

const LayeredComponent = require('./layered-component.js');

const {sortLines} = require('../graph/index.js').graph2;

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
		this.components = Array.from(components, (cmp)=>(LayeredComponent.from(cmp)));
	}
	
	points(){
		return this.components.flat();
	}
	
	edges(){
		return this.components.map(cmp=>cmp.edges()).flat();
	}
	
	hasEdge(A, B){
		return this.components.some(cmp=>cmp.hasEdge(A, B));
	}
	
	/**
	 * Добавляет на компоненты точки перекрещивания разноуовневых звеньев
	 */
	addSkewPoints(){
		
		let lines = this.edges().filter((edge)=>(edge[0].z === edge[1].z));
		
		let lines2 = lines.map((edge)=>(edge.map((v)=>v.cut(2))));
		
		let matrix = intersectMatrix(lines2);
		
		let len = matrix.length;
		
		let adding = matrix.map((row, i)=>{
			let points = row.filter((a)=>(a));
			points.sort(sorterByDirection(lines2[i]));
			points = points.filter((p, i)=>(i===0 || !p.eq(points[i-1]))); //Фильтруем уникальные точки
			if(points.length){
				let line = lines[i];
				points = points.map((p)=>(p.extend(line[0].z)));
				
				if(points.length && points[0].eq(line[0])){
					points.shift();
				}
				if(points.length && points[points.length-1].eq(line[1])){
					points.pop();
				}
				
				if(points.length){
					
					return {line, points};
				}
			}
		}).filter((a)=>(a));
		//console.log(adding);
		adding.sort((a, b)=>(b.line.index - a.line.index));
		
		adding.forEach(({line, points})=>{
			line.parent.esplice(line.index, 0, ...points);
		});
		
		this.annoteSkews();
	}
	
	/**
	 * Найти и обозначить двойные точки, не принадлежащие вертикалям
	 */
	annoteSkews(){
		let points = this.points();
		//console.log(points);
		let points2 = points.map(p=>p.cut(2));
		let keys = convertToKeys(points2);
		let map = new MapOfSet();
		keys.forEach((key, i)=>{
			map.add(key, points[i]);
		});
		for(let [key, set] of map.entries()){
			if(set.size === 2){
				if(this.hasEdge(...set)){
				}
				else{
					let [A, B] = [...set];
					A.skew = true;
					B.skew = true;
					A.skewlink = B;
					B.skewlink = A;
				}
			}
			else if(set.size > 2){
				console.log(set);
				throw new Error('Тройная точка ' + [...set]);
			}
		}
		
	}
	
	joinCollinears(eps){
		this.components.forEach(cmp=>cmp.joinCollinears(eps));
	}
	
	moveAllZtoAngle(eps){
		this.components.forEach(cmp=>cmp.moveAllZtoAngle(eps));
	}
	
	moveAllZoutAngle(eps){	
		this.components.forEach(cmp=>cmp.moveAllZoutAngle(eps));
	}
	
	/**
	 * Собрать воедино смежные компоненты
	 */
	assemblyConnectedComponents(){
		let map = mapOfVectors(this.points());
		let parts = convertToKeys(this.components);
		let {opened, closed} = sortLines(parts);
		//console.log({opened, closed})
		opened = opened.map((arr)=>{
			let cmp = LayeredComponent.from(convertToVectors(arr, map));
			cmp.controlOrder();
			return cmp;
		});

		closed = closed.map((arr)=>{
			let cmp = LayeredComponent.from(convertToVectors(arr, map));
			cmp.closed = true;
			return cmp;
		});
		
		return new LevelsDiagram(opened.concat(closed));
	}	
	
	scale(xy, z){
		return new LevelsDiagram(this.components.map(cmp=>cmp.scale(xy,z)));
	}
	
	mirrorZ(){
		return new LevelsDiagram(this.components.map(cmp=>cmp.mirrorZ()));
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
		parts = parts.map(part=>part.roundedMaxRadius(0,0.01).expandEnds(1));
		
		let code = parts.map(part=>partRender(part));
		
		return code.join('\n');
	}
	
	renderToSVG(width){
		return this.render2d(part=>part.renderSVG(width));
	}
	
	renderToPS(width){
		return this.render2d(part=>part.renderPS(width));
	}
	
	renderToSCAD(width){
		let code = `radius = ${width/2};`;
		
		let comp = this.components.map(a=>a.renderToSCAD()).join('\n');
		
		return code + '\n' + comp;
	}
}

module.exports = LevelsDiagram;