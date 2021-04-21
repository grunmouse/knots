const YAML = require('yaml');
const fsp = require('fs').promises;
const sqlite = require('@grunmouse/sqlite');

function loadYAML(filepath){
	return fsp.readFile(filepath, {encoding:'utf-8'}).then((code)=>YAML.parseAllDocuments(code));
}

function loadManyYAML(patches){
	return Promise.all(patches.map(filepath=>fsp.readFile(filepath, {encoding:'utf-8'})))
		.then(data=>data.map((code)=>YAML.parseAllDocuments(code)).flat());
}

const db = new sqlite.Database();

async function initDB(){
	await db.open(':memory:');
	await db.run(`
	CREATE TABLE knot_names (
		source TEXT,
		name TEXT,
		identical INTEGER
	);
	`);
	
	await db.run(`
	CREATE TABLE schemes (
		name TEXT,
		type TEXT,
		spec TEXT
	);
	`);
	
	await db.run(`
	CREATE TABLE knot_schemes (
		knot INTEGER,
		scheme INTEGER,
		params TEXT
	);
	
	`);
	
	//console.log(a);
}

async function main(){
	await initDB();
	
	let docs = await loadManyYAML(
		[
			'./data/skryagin.yaml',
			'./data/kuryaschkin.yaml',
			'./data/identical.yaml',
			'./data/schemes.yaml'
		]
	);
	for(let doc of docs.filter(doc=>(doc.get('doctype')==='names'))){
		await names(doc);
	}

	for(let doc of docs.filter(doc=>(doc.get('doctype')==='identical'))){
		await identical(doc);
	}
	
	//await findGroupByPermutated();
	
	/*
	Находим названия, совпадающие у всех авторов
	*/
	await db.run(`INSERT INTO knot_names (source, name, identical) 
		SELECT "all" AS source, name, a
		FROM (SELECT MIN(identical) as a, MAX(identical) as b, name FROM knot_names GROUP BY name)
		WHERE a = b
	`);
	
	for(let doc of docs.filter(doc=>(doc.get('doctype')==='schemes'))){
		await schemes(doc);
	}
	
	//console.log(await db.all('SELECT rowid, * FROM knot_names WHERE source = "all";'));	
	console.log(await db.all('SELECT rowid, * FROM knot_schemes;'));	
}

const handlers = {
	names,
	identical,
	schemes
}

const annoteSource = source => names => Array.from(names, (name)=>({source, name}));

function bucksify(obj){
	let result = {};
	for(let key in obj){
		let newkey = key;
		if(newkey[0]!== '$'){
			newkey = '$' + newkey;
		}
		result[newkey] = obj[key];
	}
	return result;
}

async function groupIdentical(arr){
	let stat = await db.prepare('SELECT identical FROM knot_names WHERE source = $source AND name = $name;');
	let ids = new Set();
	for(let row of arr){
		let data = await stat.get(bucksify(row));
		let id = data.identical;
		ids.add(id);
	}
	let identical = Math.min(...ids);
	
	stat = await db.prepare(`UPDATE knot_names SET identical = ${identical} WHERE identical = $id`);
	for(let $id of ids){
		if($id != identical){
			await stat.run({$id});
		}
	}
}

async function findGroupByPermutated(){
	const knots = await db.all('SELECT rowid, name, source FROM knot_names WHERE rowid = identical;');
	const exclude = new Set();
	const by_names = new Map(knots.map((knot)=>([knot.name.toLowerCase(), knot])));
	
	for(let knot of knots) if(!exclude.has(knot.rowid)){
		let {source, name} = knot;
		let words = name.split(' ');
		if(words.length > 1){
			//console.log(words);
			const q = 'VALUES ' + words.map(a=>('("'+a+'")')).join(',');
			
			console.log(await db.all(q));
		}
	}
}

async function handleIdentical(identical){
	for(let group of identical){
		await groupIdentical(group);
	}
}

async function findKnot(index){
	if(typeof index === 'string'){
		let a = await db.get(`SELECT identical FROM knot_names WHERE source = "all" AND name = "${index}";`);
		if(!a){
			console.log(index);
		}
		return a.identical;
	}
	else if(index.source){
		let a = await db.get(`SELECT identical FROM knot_names WHERE source = "${index.source}" AND name = "${index.name}";`);
		if(!a){
			console.log(index);
		}
		return a.identical;
	}
}

async function schemes(doc){
	let data = doc.toJSON().data;
	
	let addScheme = await db.prepare('INSERT INTO schemes (name, type, spec) VALUES ($name, $type, $spec);');
	let addKnotScheme = await db.prepare('INSERT INTO knot_schemes (scheme, knot, params) VALUES ($scheme, $knot, $params);')
	for(let scheme of data){
		let a = await addScheme.run({$name:scheme.name, $type:scheme.type, $spec:JSON.stringify(scheme)});
		let $scheme = a.stmt.lastID;
		for(let prod of scheme.product){
			let $knot = await findKnot(prod.knot);
			let $params = JSON.stringify(prod.params);
			await addKnotScheme.run({$knot, $scheme, $params});
		}
	}
}

async function names(doc){
	const data = doc.toJSON();
	const source = data.source;
	const makeRows = annoteSource(source);
	
	const names = makeRows(new Set(data.names.flat()));
	const identical = data.names.filter(a=>Array.isArray(a)).map(makeRows);
	
	let stat = await db.prepare('INSERT INTO knot_names (source, name) VALUES ($source, $name);');
	
	for(let row of names){
		await stat.run(bucksify(row));
	}
	
	await db.run('UPDATE knot_names SET identical = rowid WHERE identical is NULL;');
	
	await handleIdentical(identical);
	
}

async function identical(doc){
	const data = doc.toJSON();
	if(typeof data.source === 'string'){
		const identical = data.data.map(annoteSource(data.source));
		await handleIdentical(identical);
	}
	else if(Array.isArray(data.source) && data.mode==='all'){
		let source = data.source;
		let cross = await db.all(`
			SELECT L.name FROM 
				(SELECT name FROM knot_names WHERE source = "${source[0]}") AS L
				INNER JOIN
				(SELECT name FROM knot_names WHERE source = "${source[1]}") AS R
				ON L.name = R.name
			;`);
		
		for(let item of cross){
			await groupIdentical([
				{name:item.name, source:source[0]},
				{name:item.name, source:source[1]}
			]);
		}
	}
}

main().catch(err=>console.log(err.stack));