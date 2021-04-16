const {symbols:{SUB, ADD, MUL, DIV}} = require('@grunmouse/multioperator-ariphmetic');
const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');

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
 * Находит четвёртую точку прямоугольного дельтоида, у которого углы B и D прямые
 */
function deltoid(B, A, D){
	let AD = D.sub(A);
	let ort = B.sub(A).add(AD).ort();
	let AC = ort.mul(AD.dot(ort));
	
	return A.add(AC);
}

/**
 * отсекает на угле BAD равнобедренный угол B'AD' со сторонами a
 */
function isosceles(B, A, D, a){
	let B1 = B.sub(A).ort().mul(a).add(A);
	let D1 = D.sub(A).ort().mul(a).add(A);
	return [B1, A, D1];
}

/**
 * отсекает на угле BAD равнобедренный угол B'AD', описанный около дуги радиусом r
 */
function isoradial(B, A, D, r){
	let cos = Vector.cosDiff(B.sub(A), D.sub(A));
	let tan = Math.tan(Math.acos(cos)/2);
	let a = r / tan;
	return isosceles(B, A, D, a);
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
 *
 * Проверка на R \in AB
 */
function isInPart(R, [A, B]){
	let AR = R.sub(A), AB = B.sub(A);
	let proj = AR.dot(AB)/AB.abs();
	
	return proj>=0 && proj<=AB.abs();
}

function sorterByDirection([A, B]){
	let AB = B.sub(A);
	return (P, Q)=>{
		let p = P.sub(A).dot(AB);
		let q = Q.sub(A).dot(AB);
		return p-q;
	}
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
	let ctrl = Math.abs(N / W.dot(V));
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
	if(R){
		if(isInPart(R, AB) && isInPart(R, CD)){
			return R;
		}
		//console.log(AB, CD, R);
	}
}


function intersectMatrix(parts){
	const result = parts.map( 
		(AB)=>parts.map((CD)=>(intersectLinePart(AB, CD)))
	);
	return result;
}

function distanceOfLinePart(P, [A, B]){
	let AB = B.sub(A);
	let AP = P.sub(A);
	let x = AP.dot(AB)/(AB.abs()**2);
	if(x>0 && x<1){
		let cos = Vector.cosDiff(AB, AP);
		//console.log(cos);
		let sin = Math.sqrt(1 - cos**2);
		let d = AP.abs()*sin;
		
		return d;
	}
	else{
		//точка не проецируется на отрезок, находим расстояние до ближайшего конца
		return Math.min(AB.abs(), P.sub(B).abs());
	}
}



/**
 * @param AB : Array[2]<Vector> - первый отрезок
 * @param CD : Array[2]<Vector> - второй отрезок
 * @param eps : number - порог значения синуса, ниже которого он считается нулевым
 */
function isCollinear([A, B], [C, D], eps){
	eps = eps || 0.01;
	let cos = Vector.cosDiff(B.sub(A), D.sub(C));
	let sin = Math.sqrt(1 - cos**2);
	return sin <= eps;
}

//скрещивающиеся skew

function wasLongest([A, B], [C, D]){
	let AB = A.sub(B).abs(), CD = C.sub(D).abs();
	return AB - CD;
}




module.exports = {
	delta,
	accum,
	isosceles,
	isoradial,
	deltoid,
	onedistanceABC,
	boldstroke,
	isInPart,
	intersectLinePart,
	intersectMatrix,
	sorterByDirection,
	distanceOfLinePart,
	isCollinear,
	wasLongest
};