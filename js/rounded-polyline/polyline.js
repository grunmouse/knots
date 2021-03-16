const {symbols:{SUB, ADD, MUL, DIV}} = require('@grunmouse/multioperator-ariphmetic');

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


module.exports = {
	delta,
	accum,
	boldstroke,
	intersectLinePart,
	intersectMatrix
	
}