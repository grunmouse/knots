const {MapOfSet} = require('@grunmouse/special-map');

const binary = require("@grunmouse/binary");
const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');


const TAU = 2*Math.PI;
const PI = Math.PI;

function pointKey(vec){
	let buff = Float64Array.from(vec.cut(2)).buffer;
	
	let value = binary.bigint.fromBuffer(buff);
	
	return value;
}

function edgeKey([p1, p2]){
	let buff = Float64Array.from([p1.x, p1.y, p2.x, p2.y]).buffer;

	let value = binary.bigint.fromBuffer(buff);
	
	return value;
}


/**
 * Создаёт таблицу инцидентости рёбер
 */
function inсendentMap(edges){
	const map = new MapOfSet();
	edges.forEach(([p1, p2])=>{
		map.add(pointKey(p1), [p1, p2]);
		map.add(pointKey(p2), [p2, p1]);
	});
	return map;
}

/**
 * Определяет положительный угол из вектора from в вектор to
 * Возвращение к тому же вектору считается полным оборотом
 */
function positAngle(from, to){
	let f = Math.atan2(from.y, from.x);
	let t = Math.atan2(to.y, to.x);
	let dir = t - f;
	
	while(dir > TAU){
		dir -= TAU;
	}
	while(dir <= 0){
		dir += TAU;
	}
	
	return dir;
}

/**
 * Определяет угол поворота из вектора from в вектор to -PI..PI
 */
function dirAngle(from, to){
	let f = Math.atan2(from.y, from.x);
	let t = Math.atan2(to.y, to.x);
	let dir = t - f;
	
	while(dir >= PI){
		dir -= TAU;
	}
	while(dir <= -PI){
		dir += TAU;
	}
	
	return dir;
}

/**
 * Находит минимальные циклы, в которых участвуют переданные рёбра, два для каждого ребра
 */
function findMinCicles(edges){
	const all = edges.concat(edges.map(([a,b])=>([b,a]))); // каждое направление каждого ребра
	const set = new Map(all.map(a=>([edgeKey(a), {key:edgeKey(a), edge:a}]))); //Рабочий набор рёбер
	const incedent = inсendentMap(edges);
	const cycles = [];
	const cycleByEdge = new Map();
	
	while(set.size > 0){
		let item = set.values().next().value;
		let start = item.key;
		let cycle = [];
		cycles.push(cycle);
		do{
			//Добавляем найденное ребро в цикл и удаляем из рабочего набора
			cycle.push(item);
			cycleByEdge.set(item.key, cycle);
			set.delete(item.key);
			
			let [A, B] = item.edge;
			//Ищем следующий шаг после AB
			let zero = A.sub(B); //считаем углы, начиная с BA
			//выходы из B, включая BA
			let out = incedent.get(pointKey(B));
			out = [...out].map((edge)=>{
				let [A, B] = edge;
				let dir = B.sub(A);
				return {
					edge,
					dir,
					key:edgeKey(edge),
					angle:positAngle(zero, dir)
				};
			});

			out.sort((a, b)=>(a.angle - b.angle));
			
			let next = out[0]; //Выбран наибольший правый поворот

			item = next;
		}
		while(item.key !== start);
	}
	
	return cycles.map(cycle=>cycle.map(a=>(a.edge[0])));
}

/**
 * Возвращает сумму поворотов вдоль пути
 */
function pathAngle(path){
	let val = 0;
	for(let i=2; i<path.length; ++i){
		let [A, B, C] = path.slice(i-2, i+1);
		val += dirAngle(B.sub(A), C.sub(B));
	}
	return val;
}

module.exports = {
	findMinCicles,
	pathAngle
};