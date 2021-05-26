/*
P1 = A
P2 = (- 5A + 18B — 9C + 2D) / 6
P3 = ( 2A — 9B + 18C — 5D) / 6
P4 = D
*/

const {Vector3, Vector2, Vector} = require('@grunmouse/math-vector');
const {SquareMatrix2} = require('@grunmouse/math-matrix');

const {
	isoradial,
	deltoid,
	intersectLine,
	intersectPartAndLine
} = require('./polyline.js');

const defsepdir = new Vector2(0, 1);

function AbstractSegment(attributes){
	const {
		x0, dir0, dir1, length
	} = attributes;
	const x1 = x0 + length;
	const P0 = new Vector2(x0,0);
	const P1 = new Vector2(x1,0);
	const line0 = [P0, P0.add(dir0)];
	const line1 = [P1, P1.add(dir1)];
	
	return {
		...attributes,
		x1,
		P0,
		P1,
		line0,
		line1
	};
}

/**
 * Вычисляет опорные точки кривой Безье, проходящей через переданные четыре точки
 */
function besierForPoints(A, B, C, D){
	/*
		P1 = A
		P2 = (- 5A + 18B - 9C + 2D) / 6
		P3 = ( 2A - 9B + 18C - 5D) / 6
		P4 = D
	*/
	
	const P2 = A.mul(-5).add(B.mul(18)).add(C.mul(-9)).add(D.mul(2)).div(6);
	const P3 = A.mul(2).add(B.mul(-9)).add(C.mul(18)).add(D.mul(-5)).div(6);
	
	return [A, P2, P3, D];
}

function LineSegment(attributes){
	const {
		start,
		fin,
		startline,
		endline,
		x0
	} = attributes;

	const OX = fin.sub(start);
	const rot = SquareMatrix2.rotate(OX.phi());
	const rotin = rot.transpose();

	let dir0 = startline ? rotin.mul(startline) : defsepdir;
	if(dir0.y < 0){
		dir0 = dir0.neg();
	}
	let dir1 = endline ? rotin.mul(endline) : defsepdir;
	if(dir1.y < 0){
		dir1 = dir1.neg();
	}

	let length = fin.sub(start).abs();
	
	/**
	 * Преобразует относительные координаты в абсолютные
	 */
	function convert(P){
		const {rot, P0, start} = this;
		return rot.mul(P.sub(P0)).add(start);
	}
	
	return AbstractSegment({
		...attributes,
		dir0,
		dir1,
		length,
		rot,
		
		convert
	});
}

function ArcSegment(attributes){
	const {
		start,
		fin,
		radius,
		center,
		x0
	} = attributes;
	let length = Vector.angle(start.sub(center), fin.sub(center)) * radius;	
	
	const R0 = start.sub(center);
	const R1 = fin.sub(center);
	const phi0 = R0.phi();
	
	const sign = Math.sign(R0.cross(R1)); // знак направления поворота
	
	function convert(P){
		const {P0, radius, sign, phi0, center} = this;
		let {x, y} = P.sub(P0);
		let abs = radius - sign*y
		let phi = sign*x/radius + phi0;
		
		return Vector2.fromPolar({abs,phi}).add(center);
	}
	
	function convertPolar(P){
		const {P0, radius, sign, phi0, center} = this;
		let {x, y} = P.sub(P0);
		let abs = radius - sign*y
		let phi = sign*x/radius + phi0;
		return {abs,phi};
	}
	
	return AbstractSegment({
		...attributes,
		dir0: defsepdir,
		dir1: defsepdir,
		length,
		sign,
		phi0,
		
		convert,
		convertPolar
	});
}

/**
 * Для скруглённой полилинии, заданной массивом расширенных точек, строит массив прямых и круглых частей
 */
function convertRounded(points){
	const result = [];
	const defsepdir = new Vector2(0, 1);
	
	let prev = points[0], startline, x0 = 0;
	
	function addLine(fin, endline){
		let seg = LineSegment({start:prev, fin, startline, endline, x0});
		result.push(seg);
		x0 = seg.x1;
		prev = fin;
		startline = endline;
	}
	
	function addArc(fin, center, radius, apex){
		let seg = ArcSegment({start:prev, fin, center, radius, x0, apex, arct:true});
		result.push(seg);
		x0 = seg.x1;
		prev = fin;
		startline = undefined;
	}
	
	for(let i=1; i<points.length; ++i){
		let A = points[i];
		if(A.radius){
			let B = points[i-1];
			let D = points[i+1];
			let [B1, _, D1] = isoradial(B, A, D, A.radius);
			let R = deltoid(B1, A, D1);
			addLine(B1);
			addArc(D1, R, A.radius, A);
		}
		else{
			let B = points[i-1];
			let D = points[i+1];
			let endline;
			if(D){
				let sepline = B.sub(A).ort().add(D.sub(A).ort());
				if(sepline.abs()>0){
					endline = sepline.ort();
				}
			}
			addLine(A, endline);
		}
	}
	
	return result;
}

/**
 * Усекает отрезок пределами сегмента
 * @param AB : Array[2]<Vector2> - исходный отрезок
 * @param seg : Segment - сегмент
 *
 * @return Object
 * @property part : Array[2]<Vector2> - обрезанный отрезок
 * @property empty : Boolean - признак отсутствия отрезка
 * @property ext0 : Boolean - признак выхода за начало
 * @property ext1 : Boolean - признак выхода за конец
 */
function cutLineBySeg(AB, seg){
	let [A, B] = AB;
	let {P0, P1, dir0, dir1, line0, line1} = seg;
	
	/*
	 Обозначим
	 P = (AB) \intersect line0
	 Q = (AB) \intersect line1
	 */
	
	const AaftP = A.sub(P0).cross(dir0) < 0; // A за P
	const AaftQ = A.sub(P1).cross(dir1) > 0; // A за Q
	const BaftP = B.sub(P0).cross(dir0) < 0; // B за P
	const BaftQ = B.sub(P1).cross(dir1) > 0; // B за Q
	
	//console.log(AaftP, AaftQ, BaftP, BaftQ);
	
	/*
	AaftP AaftQ BaftP BaftQ
	0     0     0     0 //AB
	0     0     0     1 //AQ
	0     0     1     0 //AP
	0     1     0     0 //QB
	1     0     0     0 //PB
	0     0     1     1 //A(P|Q)
	1     1     0     0 //(P|Q)B
	0     1     1     0 //QP
	1     0     0     1 //PQ
	0     1     0     1 //emp
	1     1     0     1 //emp
	0     1     1     1 //emp
	1     0     1     0 //emp
	1     0     1     1 //emp
	1     1     1     0 //emp
	1     1     1     1 //emp
	*/	
	
	const result = {
		ext0: AaftP || BaftP,
		ext1: AaftQ || BaftQ
	};
	
	if(!AaftP && !AaftQ && !BaftP && !BaftQ){
		//Усечение не требуется
		result.part = [A, B];
	}
	else if(AaftP && BaftP || AaftQ && BaftQ){
		//Весь отрезок за line0 или line1
		result.empty = true
	}
	else{
		const P = intersectPartAndLine(AB, line0);
		const Q = intersectPartAndLine(AB, line1);
		
		const notP = !P || P.sub(P1).cross(dir1) > 0; //P вне области
		const notQ = !Q || Q.sub(P0).cross(dir0) < 0; //Q вне области
		const QeqP = P && Q && P.eq(Q);
		
		if(AaftP && AaftQ){
			// !BaftP && BaftQ
			if(notP){
				result.part = [Q, B];
			}
			else if(notQ || QeqP){
				result.part = [P, B];
			}
			else{
				throw new Error('Неизвестное состояние');
			}
		}
		else if(BaftP && BaftQ){
			// !AaftP && AaftQ
			if(notP){
				result.part = [A, Q];
			}
			else if(notQ || QeqP){
				result.part = [A, P];
			}
			else{
				throw new Error('Неизвестное состояние');
			}
		}
		else if(AaftP && BaftQ){
			result.part = [P, Q];
		}
		else if(AaftQ && BaftP){
			result.part = [Q, P];
		}
		else if(AaftP){
			result.part = [P, B];
		}
		else if(AaftQ){
			result.part = [Q, B];
		}
		else if(BaftP){
			result.part = [A, P];
		}
		else if(BaftQ){
			result.part = [A, Q];
		}
	}
	
	if(!result.empty && result.part[0].eq(result.part[1])){
		delete result.part;
		result.empty = true;
	}
	
	return result;
}

/**
 * Преобразует отрезок AB координатах сегмента seg в реальные отрезок или кривую
 */
function convertLineFromSeg(AB, seg){
	let [A, B] = AB;
	let [start, fin] = AB.map((P)=>(seg.convert(P)));
	if(seg.radius){
		if(A.x == B.x){
			//line
			return {type:'line', start, fin};
		}
		else if(A.y == B.y){
			let radius = start.sub(seg.center).abs();
			return {type:'arc', start, fin, radius, center:seg.center, sign:seg.sign, arct:seg.arct};
		}
		else{
			let P2 = B.sub(A).mul(1/3).add(A);
			let P3 = B.sub(A).mul(2/3).add(A);
			let curvePoints = [A, P2, P3, B].map((P)=>(seg.convert(P)));
			let points = besierForPoints(...curvePoints);
			return {type:'curve', start, fin, points};
		}
	}
	else{
		return {type:'line', start, fin};
	}
}

function findSegmenByPoint(A, segs){
	let index = segs.findIndex((seg)=>(seg.x0<=A.x && seg.x1 >= A.x));
	
	while(true){
		let seg = segs[index];
		if(!seg){
			return -1;
		}
		let {P0, P1, dir0, dir1, line0, line1} = seg;
		
		if(A.sub(P0).cross(dir0) < 0){
			--index;
		}
		else if(A.sub(P1).cross(dir1) > 0){
			++index;
		}
		else{
			return index;
		}
	}
}

function convertLineFrom(AB, segs){
	let [A, B] = AB;
	
	let index = findSegmentByPoint(A, segs);
	
	let result = [];
	
	let cuting = cutLineBySeg(AB, segs[index]);
	result.push(convertLineFromSeg(cuting.part, segs[index]));
	
	let go = 0;
	if(cuting.ext0){
		while(cuting.ext0){
			--index;
			cuting = cutLineBySeg(AB, segs[index]);
			result.push(convertLineFromSeg(cuting.part, segs[index]));
		}
	}
	else if(cuting.ext1){
		while(cuting.ext1){
			++index;
			cuting = cutLineBySeg(AB, segs[index]);
			result.push(convertLineFromSeg(cuting.part, segs[index]));
		}
	}
	
	return result;
}

function convertPolylineFrom(points, segs){
	let result = [];
	for(let i=1; i <= points.length; ++i){
		result.push(convertLineFrom([points[i-1], points[i]], segs));
	}
	return result;
}

module.exports = {
	convertRounded,
	cutLineBySeg,
	convertLineFromSeg
};