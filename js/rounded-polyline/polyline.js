const {symbols:{SUB, ADD, MUL, DIV}} = require('@grunmouse/multioperator-ariphmetic');
const {Vector3, Vector2} = require('@grunmouse/math-vector');
const {MapOfSet} = require('@grunmouse/special-map');
const binary = require("@grunmouse/binary");

function VectorKey(vec){
	let buff = new Float64Array.from(vec).buffer;
	
	let value = binary.bigint.fromBuffer(buff);
	
	return value;
}

/**
 * Находит массив разностей точек
 */
function delta(arr){
	let len = arr.length-1;
	let res = [];
	for(let i=0;i<len; ++i){
		res[i] = arr[i+1][SUB](arr[i]);
	}
	return res;
}

/**
 * Возвращает массив накопленных сумм значений входного массива
 */
function accum(start, arr){
	let res = [start];
	for(let item of arr){
		start = start[ADD](item);
		res.push(start);
	}
	return res;
}

function onedistanceABC(A, B, C){
	const AB = B.sub(A), BC = C.sub(B);
	const e0 = AB.ort().rotOrto(1);
	const e1 = BC.ort().rotOrto(1);
	
	const r = e0.add(e1).div(1 + e0.dot(e1));
	
	return r;
}

/**
 * Рассчитывает единичное смещение точек ломаной, эквидистатной заданной
 */
function onedistance(B){
	const dotB = delta(B);
	const e = dotB.map((v)=>(v.ort().rotOrto(1)));
	const r = [];
	const n = B.length-1;
	r[0] = e[0];
	r[n] = e[n-1];
	
	for(let i=1; i<n; ++i){
		r[i] = e[i-1].add(e[i]).div(
			1 + e[i-1].dot(e[i])
		);
	}
	return r;
}

/**
 * Возвращает две ломаные, эквидистантные заданной, и располагающиеся от неё сразных сторон
 */
function boldstroke(B, s){
	const r = onedistance(B);
	let R = [], L = [];
	
	for(let i=0; i<B.length; ++i){
		R[i] = r[i].mul(-s).add(B[i]);
		L[i] = r[i].mul(s).add(B[i]);
	}
	
	return {L, R};
}

/**
 * Проверяет, попадает ли точка R в прямоугольную область между вершинами AB
 * Если подставить коллинеарные вектора - это будет проверка на R \in AB
 */
function isIn(R, [A, B]){
	let AR = R.sub(A), AB = B.sub(A);
	
	for(let i=0; i<R.length; ++i){
		if(AR[i]<0 || AR[i]>AB[i]){
			return false;
		}
	}
	return true;
}

/**
 * Находит точку пересечения прямых AB и CD
 */
function intersectLine([A, B], [C, D]){
	const V = B.sub(A), W = D.sub(C); //Направляющие вектора прямых
	/*
	R_00 = A; R_01 = B; r_0 = V;
	R_10 = C; R_11 = D; r_1 = W;
	
	R = \frac{r_0 (R_11 \times R_10) - r_1 (R_01  \times R_00)}{r_1 \times r_0}
	
	\times - псевдоскалярное произведение
	Опущен - знак умножения на число
	
	R = \frac{V (D \times C) - W (B  \times A)}{W \times V}
	*/
	
	let N = W.cross(V); //Знаменатель выражения
	
	//Проверка нуля
	let ctrl = N.div(W.dot(V));
	if(ctrl < Number.EPSILON){
		return undefined;
	}
	
	const R = V.mul(D.cross(C)).sub(W.mul(B.cross(A))).div(N);
	
	return R;
}

/**
 * Находит точку пересечения отрезков AB и CD
 */
function intersectLinePart(AB, CD){
	const R = intersectLine(AB, CD);
	if(R && isIn(R, AB) && isIn(R, CD)){
		return R;
	}
}

function intersectMatrix(parts){
	const result = Array.from(parts, 
		(AB)=>Array.from(parts, (CD)=>(intersectLinePart(AB, CD)))
	);
	return result;
}

/**
 * Делит трёхмерную ломаную со слоями массив плоских ломаных
 */
function splitByLevels(component){
	const parts = [];
	
	let part, level;
	
	for(let point of component){
		if(level !== point.z){
			part = [];
			part.color = component.color;
			level = point.z;
			parts.push(part);
		}
		part.push(point);
	}
	if(component.ended){
		part.ended = true;
	}
	if(component.started){
		parts[0].started = true;
	}
	
	//console.log(levels.map(level=>level.map(part=>expandEnds(part, 1))));
	return parts;
}

/**
 * Возвращает новую ломаную с удлинёнными концами
 * @param part : Array<Vector2>
 * @param ex : Number - длина удлинения
 *
 * @return Array<Vector2>
 */
function expandEnds(part, ex){
	let A = part[0], B = part[1], D = part[part.length-1], C = part[part.length-2];
	let BA = A.sub(B);
	let CD = D.sub(C);
	
	let dA1 = BA.ort().mul(ex);
	let dD1 = CD.ort().mul(ex);
	let A1 = A.add(dA1);
	let D1 = D.add(dD1);
	
	let result = [A1, ...part.slice(1, -1), D1];
	
	result.started = part.started;
	result.ended = part.ended;
	result.color = part.color;
	
	return result;
}



module.exports = {
	delta,
	accum,
	onedistanceABC,
	boldstroke,
	intersectLinePart,
	intersectMatrix,
	splitByLevels,
	expandEnds
};