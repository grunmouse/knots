const {Vector3, Vector2} = require('@grunmouse/math-vector');

const {MapOfSet} = require('@grunmouse/special-map');

const binary = require('@grunmouse/binary');

const {
	intersectMatrix,
	intersectLinePart,
	sorterByDirection,
	distanceOfLinePart,
	isosceles
} = require('../geometry/polyline.js');


const {
	mapOfVectors,
	convertToKeys,
	convertToVectors
} = require('./vector-map.js');
const extendVector = require('./extend-vector.js');

const LayeredComponent = require('./layered-component.js');

const {sortLines} = require('../graph/index.js').graph2;

const {
	rotateSkew
} = require('../geometry/rotate.js');

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
	
	mapmap(callback){
		const fun = (v, i, arr)=>(extendVector(callback(v, i, arr), v));
		return new LevelsDiagram(this.components.map((cmp)=>(cmp.map(fun))));
	}
	
	points(){
		return this.components.flat();
	}
	
	
	edges(){
		return this.components.map(cmp=>cmp.edges()).flat();
	}
	
	hedges(){
		return this.edges().filter((edge)=>(edge[0].z === edge[1].z));
	}
	
	hasEdge(A, B){
		return this.components.some(cmp=>cmp.hasEdge(A, B));
	}
	
	round(s){
		return this.mapmap((V)=>V.map((x)=>binary.float64.round(x, s)));
	}
	
	/**
	 * Создаёт диаграмму, точки которой выровнены относительно сетки с шагом 1 по всем осям
	 */
	toRegularScale(){
		let coord = [new Set(), new Set(), new Set()];
		this.points().forEach((A)=>{
			coord.forEach((xx, i)=>{xx.add(A[i])});
		});
		let map = coord.map((xx)=>{
			xx = [...xx].sort((a,b)=>(a-b));
			return new Map(xx.map((x, i)=>([x, i])));
		});
		
		const fun = (P)=>{
			let xx = P.map((x, i)=>(map[i].get(x)));
			return new P.constructor(...xx);
		};
		
		return this.mapmap(fun);
	}
	
	/**
	 * Добавляет на компоненты точки перекрещивания разноуовневых звеньев
	 */
	addSkewPoints(){
		
		let lines = this.hedges();
		
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
					A.skew = Math.sign(A.z - B.z);
					B.skew = -A.skew;
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
	
	
	
	/**
	 * Собрать воедино смежные компоненты
	 */
	assemblyConnectedComponents(){
		let map = mapOfVectors(this.points());
		let parts = convertToKeys(this.components);
		let {opened, closed} = sortLines(parts);

		opened = opened.map((arr)=>{
			let cmp = LayeredComponent.from(convertToVectors(arr, map));
			cmp.killPins();
			cmp.controlOrder();
			return cmp;
		});

		closed = closed.map((arr)=>{
			let cmp = LayeredComponent.from(convertToVectors(arr, map));
			cmp.killPins();
			cmp.closed = true;
			return cmp;
		});
		
		return new LevelsDiagram(opened.concat(closed));
	}	
	
	closeAll(){
		return new LevelsDiagram(this.components.map(cmp=>{
			let res = cmp.clone();
			res.closed = true;
			return res;
		}));
	}
	
	/**
	 * Рассчитывает наименьшее расстояние в плане, на которое к точке M приближаются не содержащие её отрезки
	 */
	minDistance(M){
		let d = this.hedges().map(edge=>{
			if(edge.A === M || edge.A === M.skewlink){
				return M.sub(edge.B).abs();
			}
			else if(edge.B === M || edge.B === M.skewlink){
				return M.sub(edge.A).abs();
			}
			else{
				let v = distanceOfLinePart(M.cut(2), edge.cut(2))
				if(v<1){
					//console.log(M, edge);
				}
				return v;
			}
		});
		return Math.min(...d);
	}
	
	/**
	 * Находит все пары точек скрещивания
	 */
	skewPairs(){
		const skewPoint = new Map();
		const skewPair = [];
		for(let cmp of this.components){
			for(let i = 0; i < cmp.length; ++i){
				let A = cmp[i];
				if(A.skew){
					skewPoint.set(A, {component:cmp, index:i});
					let B = A.skewlink;
					if(skewPoint.has(B)){
						skewPair.push([
							skewPoint.get(A),
							skewPoint.get(B)
						]);
					}
				}
			}
		}
		
		return skewPair;
	}
	
	/**
	 * Поворачивает все скрещивания в вертикальное положение
	 */
	rotateSkews(){
		const skewPair = this.skewPairs();
		for(let segments of skewPair){
			let cross = segments.map((seg)=>(seg.component.subarr(seg.index - 1, 3)));
			let m = this.minDistance(cross[0][1])*Math.SQRT1_2;
			let newcross = rotateSkew(cross, m);
			segments.forEach((seg, i)=>{seg.newseg = newcross[i]});
		}
		const toReplace = skewPair.flat();
		toReplace.sort((a, b)=>(b.index - a.index));
		for(let rep of toReplace){
			let {component, index, newseg} = rep;
			component.esplice(index-1, 3, ...newseg);
		}
		return this;
	}
	
	/**
	 * Проверяет можно ли замерить ребро AB на ломаную ACB, не создав новых пересечений
	 */
	allowAddingTriangle([A,B], C){
		let crossAC = this.edges().some((edge)=>{
			let R = intersectLinePart([A,C], edge);
			return R && R.ne(A);
		});
		let crossCB = this.edges().some((edge)=>{
			let R = intersectLinePart([C,B], edge);
			return R && R.ne(B);
		});
		return !crossAC && !crossCB;
	}
	
	/**
	 * Заменяет диагональные линии ломаными
	 */
	approxRectangleLines(){
		for(let cmp of this.components){
			let i = cmp.length;
			for(;i--;){
				let edge = cmp.subarr(i-1, 2);
				let [A, B] = edge;
				if(A && B && A.z === B.z && A.x !== B.x && A.y !== B.y){
					//Если ребро существует и расположено в плоскости диагонально
					let C = new Vector3(A.x, B.y, A.z);
					let D = new Vector3(B.x, A.y, A.z);
					
					if(this.allowAddingTriangle(edge, C)){
						cmp.splice(i, 0, C);
						continue;
					}
					else if(this.allowAddingTriangle(edge, D)){
						cmp.splice(i, 0, D);
						continue;
					}
					else{
						cmp.addMiddle(i);
						++i;
					}
				}
			}			
		}
	}
	
	/**
	 * Возвращает прямоугольную область, в которой расположена диаграмма
	 * @param ex : Number - поля по краям
	 */
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

	setColors(colors){
		this.components.forEach((cmp, i)=>{
			if(!cmp.color){
				cmp.color = colors[i];
			}
		});
	}
	
	findPoint(A){
		for(let cmp of this.components){
			let index = cmp.findPoint(A);
			if(index>-1){
				return [cmp, index];
			}
		}
	}
	
	pointRange(A){
		for(let cmp of this.components){
			let range = cmp.pointRange(A);
			if(range){
				return range;
			}
		}
	}
	
	/**
	 * Знак крутки перекрёстка 
	 */
	spinSkew(M){
		let N = M.skewlink;
		let [_, B] = this.pointRange(M, 1);
		let [__, D] = this.pointRange(N, 1);
		
		return this._spin([M, B], [N, D]);
	}
	
	_spin([M, B], [N, D]){
		let MB = B.sub(M);
		let ND = D.sub(N);
		let NM = M.sub(N);
		let m = ND.dot(NM.cross(MB));
		
		return Math.sign(m);
	}
	
	/**
	 * создаёт и возвращает компоненты, разрешающие скрещивание
	 * @param type = 1 - разделение A, 
	 *              -1 - B
	 */
	_seifert([A, M, B], [C, N, D], type){
		let m = this._spin([M, B], [N, D]);
		if(m<0 && type<0 || m>0 && type>0){
			return [[A, A.cut(2).extend(C.z), C], [B, B.cut(2).extend(D.z), D]];
		}
		else if(m<0 && type>0 || m>0 && type<0){
			return [[A, A.cut(2),extend(D.z), D], [C, C.cut(2).extend(B.z), B]];
		}
	}
	
	/**
	 * Создаёт новую диаграмму, разбив все перекрёстки и получив циклы сейферта
	 * @param skews - Array<[pair, type]> - пары скрещивающихся точек с решением на разбиение
	 */
	makeSeifertCycles(skews){
		const restrict = [];
		const adding = [];
		for(let [pair, type] of skews){
			let b = pair[0].component, ib = pair[0].index;
			let d = pair[1].component, id = pair[1].index;
			
			let [A, M, B] = b.subarr(ib-1, 3);
			let [C, N, D] = d.subarr(id-1, 3);
			
			let dist = this.minDistance(M);
			
			let AMB = isosceles(A, M, B, dist);
			let CND = isosceles(C, N, D, dist);
			
			restrict.push({component:b, index:ib, points:AMB});
			restrict.push({component:d, index:id, points:CND});
			
			adding.push(...this._seifert(AMB, CND, type));
		}
		
		restrict.sort((a, b)=>(b.index - a.index));
		
		for(let cmp of this.components){
			let rs = restrict.filter(({component})=>(component === cmp));
			let arr = [...cmp];
			
			for(let rule of rs){
				let {index, points:[A, M, B]} = rule;
				let tail = [B, ...arr.slice(index+1)];
				arr.splice(index, arr.length, A);
				adding.push(tail);
			}
			adding.push(arr);
		}
		
		let result = new LevelsDiagram(adding);
		
		result = result.assemblyConnectedComponents();
		
		return result;
	}
	
	polynomeKaufman(){
		let pairs = this.skewPairs();
		let size = 2n ** BigInt(pairs.lenght);
		let items = [];
		if(size === 1){
			items.push(1);
		}
		else{
			for(let code = 0n; code<size; ++code){
				let skews = pairs.map((pair, i)=>{
					let type = (code & BigInt(i)) ? -1 : 1;
					return [pair, type];
				});
				let countA = skews.reduce((akk, [pair, type])=>(akk + +(type === 1)), 0);
				let countB = skews.reduce((akk, [pair, type])=>(akk + +(type === -1)), 0);
				
				let cycles = this.makeSeifertCycles(skews);
				let countC = cycles.components.length - 1;
				
				items.push({a:countA, b:countB, c:countC});
			}
		}
		
		//TODO Здесь надо сложить элементы
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

[
	'joinCollinears',
	'moveAllZoutAngle',
	'moveAllZtoAngle',
	'moveZoutEnds'
].forEach((method)=>{
	LevelsDiagram.prototype[method] = function(...args){
		this.components.forEach(cmp=>cmp[method](...args));
		return this;
	}
});

[
	'mirrorZ',
	'scale',
	'translate',
	'clone'
].forEach((method)=>{
	LevelsDiagram.prototype[method] = function(...args){
		return new LevelsDiagram(this.components.map(cmp=>cmp[method](...args)));
	}
});

[
	'notationDowker'
].forEach((method)=>{
	LevelsDiagram.prototype[method] = function(...args){
		if(this.components.length === 1){
			return this.components[0][method](...args);
		}
		else{
			throw new Error(`Метод ${method} не может быть применён к зацеплению!`);
		}
	}
});


module.exports = LevelsDiagram;