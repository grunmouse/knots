const {
	svg,
	svgPart,
	svgPolyline
} = require('../../render/index.js');

const {
	rotateSkew,
	squarePoint,
	buildArc
} = require('../rotate.js');

const LevelsDiagramm = require('../../model/levels-diagram.js');

const {Vector3, Vector2} = require('@grunmouse/math-vector');

const fs = require('fs');
const PI = Math.PI;

function rectangleArea(points, ex){
	ex =  ex || 0;
	let x = points.map(v=>v.x);
	let y = points.map(v=>v.y);
	x.sort((a,b)=>(a-b));
	y.sort((a,b)=>(a-b));
	
	return [
		new Vector2(x[0] -ex, y[0] -ex),
		new Vector2(x.pop() +ex, y.pop()+ex)
	];
}

function generateCross(b, d, r, center){
	center = center || new Vector2(0,0);
	if(!Array.isArray(r)){
		r = [r,r,r,r];
	}
	while(r.length<3){
		r = [...r, ...r];
	}
	let M = center.extend(1);
	let N = center.extend(0);
	let A = squarePoint(PI+b).mul(r[0]).extend(0).add(M);
	let B = squarePoint( b).mul(r[1]).extend(0).add(M);
	let C = squarePoint(d).neg().mul(r[2]).extend(0).add(N);
	let D = squarePoint(d).mul(r[3]).extend(0).add(N);
	
	return [[A,M,B],[C,N,D]];
}

function renderCross(cross, t){
	t = t || new Vector2(0,0);
	let [bottom, top] = cross.slice(0).sort((a,b)=>(a[0].z - b[0].z));

	let area = [new Vector2(-25, -25), new Vector2(25, 25)];

	bottom = svgPolyline(bottom);
	top = svgPolyline(top);
	let body =`
<path stroke="black" fill="none" style="stroke-width:0.25" d="M 0 -25 L 0 25" /> 
<path stroke="black" fill="none" style="stroke-width:0.25" d="M -25 0 L 25 0" /> 
<path stroke="black" fill="none" style="stroke-width:0.25" d="M -20 -20 L -20 20 L 20 20 L 20 -20 Z" /> 

<g transform="translate(${-t.x}, ${-t.y})" >
<path stroke="blue" fill="none" d="${bottom}" style="stroke-width:2" />
<path stroke="red" fill="none" d="${top}"  style="stroke-width:2" />
</g>`;

	return svg(body, area);
}

const sample = [
[
  [
    new Vector3( 10, 10, 0 ),
    new Vector3( 15, 15, 0 ),
    new Vector3( 20, 20, 0 )
  ],
  [
    new Vector3( 10, 20, -10 ),
    new Vector3( 15, 15, -10 ),
    new Vector3( 20, 10, -10 )
  ]
],
[
  [
    new Vector3( 0, 10, -10 ),
    new Vector3( 5, 5, -10  ),
    new Vector3( 10, 0, -10 )
  ],
  [
    new Vector3( 0, 0, 0   ),
    new Vector3( 5, 5, 0   ),
    new Vector3( 10, 10, 0 )
  ]
],
[
  [
    new Vector3( 20, 0, -10  ),
    new Vector3( 25, 5, -10  ),
    new Vector3( 30, 10, -10 )
  ],
  [
    new Vector3( 20, 10, 0 ),
    new Vector3( 25, 5, 0  ),
    new Vector3( 30, 0, 0  )
  ]
],
[
  [
    new Vector3( 30, 10, -10 ),
    new Vector3( 35, 15, -10 ),
    new Vector3( 40, 20, -10 )
  ],
  [
    new Vector3( 30, 20, 0 ),
    new Vector3( 35, 15, 0 ),
    new Vector3( 40, 10, 0 )
  ]
]
];

let [b, d] = [-PI/2, 0];
//let [b, d] = [ -0.2853981633974483, 1.2853981633974483 ];
//let cross = generateCross(b, d, [25, 30], new Vector2(0, 0));

let cross = sample[0];

let t = cross[0][1].cut(2);

cross = rotateSkew(cross, 5);
console.log(cross);

fs.writeFileSync('exp.svg', renderCross(cross, t));