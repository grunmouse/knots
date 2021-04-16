const PI = Math.PI;
const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');

/**
 * Выбирает направление поворота пересечения и рассчитыает конечные углы
 * @param b - угловое направление отрезка AB
 * @param d - угловое направление отрезка CD
 * d>b;
 * @return [b2, d2] - новые углы b и d
 */
function selectCrossDirect(b, d){
	let c = (b+d)/2; //направление биссектрисы, постоянное на первом этапе
	let s = d-b;
	let m = PI/2 - s;
	let b1 = b - m/2; //Раздвигаем направления до угла PI/2
	let d1 = d + m/2;
	
	let dir = Math.sin(b1);
	let b2 = dir >=0 ? PI/2 : -PI/2;
	let d2 = b2 + PI/2;
	
	//return [b1, d1];
	return [b2, d2];
}

/**
 * Находит точку единичного квадрата по углу
 * @return {Vector2}
 */
function squarePoint(angle){
	let s = Math.sin(angle);
	let c = Math.cos(angle);
	let x = s!=0 ? c/Math.abs(s) : Math.sign(c);
	let y = c!=0 ? s/Math.abs(c) : Math.sign(s);
	if(x>1)  x = 1;
	if(x<-1) x = -1;
	if(y>1)  y = 1;
	if(y<-1) y = -1;
	return new Vector2(x,y);
}

/**
 * Строит прямоугольную ломаную с угла from до угла to
 * @return {Array<Vector2>}
 */
function buildArc(from, to){
	//console.log('build arc', [from, to]);
	let F = squarePoint(from);
	let T = squarePoint(to);
	//console.log(F, T);
	let dX = T.x - F.x;
	let dY = T.y - F.y;
	
	let dir = to - from;
	//return [F, T]
	
	if(dX === 0 || dY === 0){
		return [F, T];
	}
	else{
		if(Math.abs(F.x)===1){
			let S = new Vector2(F.x, T.y/2);
			let P = new Vector2(T.x, T.y/2);
			return [F, S, P/*, T*/];
		}
		else if(Math.abs(F.y) === 1){
			let S = new Vector2(T.x/2, F.y);
			let P = new Vector2(T.x/2, T.y);
			return [F, S, P/*, T*/];
		}
	}
}

function rotateLine(line, m, b, b1, rev){
	let A, M, B;
	if(rev){
		[B, M, A] = line;
	}
	else{
		[A, M, B] = line;
	}
	//console.log(b, b1);
	let arcA = buildArc(PI+b, PI+b1);
	let arcB = buildArc(b, b1).reverse();
	//let arcA = arcB.map(
	
	arcA = arcA.map(v=>v.mul(m).extend(0).add(M));
	arcB = arcB.map(v=>v.mul(m).extend(0).add(M));
	
	let result = [A,...arcA, M, ...arcB, B];
	if(rev){
		result.reverse();
	}
	return result;
}

/**
 * Поворачивает скрещивание в вертикальное положение, производя деформацию в пределах квадратной области m
 * @param parts : Array[2]<Array[3]<Vector3>> - два отрезка с обозначенными точками скрещивания
 * @param m : Number - полусторона области преобразования
 *
 * @return Array[2]<Array<Vector3>> - два отрезка ломаных для замены исходных двух отрезков (в том же порядке)
 */
function rotateSkew(parts, m){
	let [bottom, top] = parts.slice(0).sort((a, b)=>(a[1].z - b[1].z));
	let [A,M,B] = top;
	let [C,N,D] = bottom;
	let AB = B.sub(A), CD = D.sub(C);
	let b = Math.atan2(AB.y, AB.x);
	let d = Math.atan2(CD.y, CD.x);
	
	let rev = false;
	if(d < b){
		/* 
		Если относительная ориентация неправильная, будем рассматривать bottom в обратном порядке.
		Соответственно угол будет противоположый
		*/
		d += PI;
		rev = true;
	}
	
	let [b1, d1] = selectCrossDirect(b, d);
	
	top = rotateLine(top, m, b, b1);
	bottom = rotateLine(bottom, m, d, d1, rev);
	
	if(parts[0].z === top[0].z){
		return [top, bottom];
	}
	else{
		return [bottom, top]
	}
}

module.exports = {
	rotateSkew,
	squarePoint,
	buildArc
}