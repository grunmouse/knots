
const Drawer = require('./rounded-polyline/two-level-diagram-drawer.js');

const fsp = require('fs').promises;

const {svg} = require('./svg-code.js');
const {eps} = require('./eps-code.js');

const {
	use,
	compile
} = require('@grunmouse/format-recursive');

const {
	simpleKnot,
	simpleKnot2,
	doubleSimpleKnot
} = require('./knots/simple-blood.js');

const {
	stividor
} = require('./knots/stividor.js');

const colors = [
	"#FED6BC",
	"#FFFADD",
	"#C3FBD8",
	"#B5F2EA",
	"#C6D8FF"
];

function doRender(knot){
	knot.components.forEach((cmp, i)=>{cmp.color = colors[i]});
	
	return eps(knot.renderToPS(2), knot.rectangleArea(5));
}


function knotWriter(path, scheme){
	return function(...args){
		let code = doRender(scheme(...args));
		let filename = path + '-' + args.join('-') + '.eps';
		return fsp.writeFile(filename, code);
	}
}

const scheme1 = knotWriter('../tex/knots/images/simple', simpleKnot);
const scheme1v2 = knotWriter('../tex/knots/images/simple-v2', simpleKnot2);
const scheme2 = knotWriter('../tex/knots/images/double-simple', doubleSimpleKnot);
const scheme3 = knotWriter('../tex/knots/images/stividor', stividor);

async function main(){
	await Promise.all([0,1,2].map((i)=>scheme1(i)));
	await Promise.all([0,1,2].map((i)=>scheme1v2(i)));
	await Promise.all([0,1,2,3].map((i)=>scheme3(i)));
	await Promise.all([
		[1,1],
		[2,1],
		[2,2],
		[2,3],
		[3,1],
		[3,2],
		[3,3]
	].map((i)=>scheme2(...i)));

}

main().catch(e=>console.log(e.stack));