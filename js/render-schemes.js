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
		let code = fs.readFileSync(Path.join(module.path, 'knots', filename), {encoding:'utf8'});
		let env = Drawer.draw(code, params);

		let knot = new LevelsDiagram(env.components);
		return knot;
	}
}

function paramToName(params){
	return Object.keys(params).sort().map((key)=>(key + params[key])).join('');
}

async function handleFile(texfilepath){
	texfilepath = Path.join(module.path, '..', texfilepath)
	let dir = Path.dirname(texfilepath);
	
	let code = await fsp.readFile(texfilepath, {encoding:'utf8'});
	
	let comment = code.match(/scheme:\s*(.*)((?:[\r\n]+view:.+)+)/i);
	if(comment){
		let scheme = comment[1];
		let views = comment[2].split(/[\r\n]+view:\s*/g).filter((a)=>(a)).map((str)=>(JSON.parse(str)));
				
		draw = drawScheme(scheme + '.txt');
		for(let params of views){
			let knot = draw(params);
			knot = knot.assemblyConnectedComponents();			
			knot.addSkewPoints();
			knot.moveAllZoutAngle();

			knot = knot.scale(10, 10);
			
			knot.components.forEach((cmp, i)=>{
				if(!cmp.color){
					cmp.color = colors[i];
				}
			});
			
			
			let filename = scheme + '-' + paramToName(params) + '.eps';
			let filepath = Path.join(dir, 'images', filename);
			
			await fsp.writeFile(filepath, eps(knot.renderToPS(2), knot.rectangleArea(5)));
		}
	}
}

async function main(){

	await handleFile('tex/knots/schemes/s-01.tex');
	await handleFile('tex/knots/schemes/s-02.tex');
	await handleFile('tex/knots/schemes/s-03.tex');
	await handleFile('tex/knots/schemes/s-04.tex');
	await handleFile('tex/knots/schemes/s-05.tex');
	await handleFile('tex/knots/schemes/s-06.tex');
	await handleFile('tex/knots/schemes/s-07.tex');
	await handleFile('tex/knots/schemes/s-08.tex');
	await handleFile('tex/knots/schemes/s-09.tex');
	await handleFile('tex/knots/schemes/s-10.tex');
	await handleFile('tex/knots/schemes/s-11.tex');
}

main().catch(e=>console.log(e.stack));