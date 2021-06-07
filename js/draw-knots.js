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
		let code = fs.readFileSync(Path.join(module.path, '../schemes', filename), {encoding:'utf8'});
		let env = Drawer.draw(code, params);

		let knot = new LevelsDiagram(env.components);
		return knot;
	}
}

async function paintScheme(name){
	const draw = drawScheme(name + '.txt');
	let knot = draw({});
	knot = knot.assemblyConnectedComponents();			
	knot.addSkewPoints();
	knot.moveAllZoutAngle();

	knot = knot.scale(10, 10);
	
	knot.components.forEach((cmp, i)=>{
		if(!cmp.color){
			cmp.color = colors[i];
		}
	});
	
	
	let filename = name + '.eps';
	let filepath = Path.join(filename);
	
	await fsp.writeFile(Path.join(module.path, '../tex/images', filename), eps(knot.renderToPS(2), knot.rectangleArea(5)));
}

async function main(){
	await paintScheme("infinity");
	await paintScheme("hunter-bend");
	await paintScheme("kolobok-goldobina");
}

main().catch(e=>console.log(e.stack));