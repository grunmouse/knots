const fs = require('fs');
const fsp = fs.promises;

const Path = require('path');

const promisify = require('util').promisify;
const child_process = require('child_process');
const exec = promisify(child_process.exec);

const Drawer = require('./drawer/multi-level-drawer.js');

const LevelsDiagram = require('./model/levels-diagram.js');

const {eps} = require('./render/index.js');

require('util').inspect.defaultOptions.depth = 20;


const colors = [
	"#FED6BC",
	"#FFFADD",
	"#C3FBD8",
	"#B5F2EA",
	"#C6D8FF"
];

function drawScheme(filename){
	return function(params){
		let code = fs.readFileSync( filename, {encoding:'utf8'});
		let env = Drawer.draw(code, params);

		let knot = new LevelsDiagram(env.components);

		knot = knot.assemblyConnectedComponents();			
		knot.addSkewPoints();
		knot.moveAllZoutAngle();

		return knot;
	}
}

const [nodepath, sctiprpath, filename, param$, into] = process.argv;

let param = param$.split(';').map(str=>(str.split(':')));
param.forEach((pair)=>{pair[1] = +pair[1];});
param = Object.fromEntries(param);

const draw = drawScheme(filename);
let knot = draw(param);

knot = knot.scale(10, 10);

knot.components.forEach((cmp, i)=>{
	if(!cmp.color){
		cmp.color = colors[i];
	}
});

//console.log(into);

fs.writeFileSync(into, eps(knot.renderToPS(2), knot.rectangleArea(5)));
