const {
	dev:{
		FIRST,
		FOLLOW,
		parseNotation,
		buildGraph,
		makeStates,
		toDot
	},
	makeSyntax,
	makeTranslator
} = require('@grunmouse/syntax-lr0');

const lexer = require('./lexer.js');

const fs = require('fs');
const Path = require('path');

const notation = fs.readFileSync(Path.join(module.path, 'syntax.txt'), {encoding:'utf8'});
const sample = fs.readFileSync(Path.join(module.path, 'sample2.txt'), {encoding:'utf8'});

//console.log(notation);
const {all} = parseNotation(notation);

console.log(all);

const graph = buildGraph('<MAIN>', all);

console.log(graph);

const {edges, reduce, handlers} = graph;

const config = makeStates(edges, reduce, handlers);

fs.writeFileSync(Path.join(module.path, 'out.json'), JSON.stringify(config,'','\t'));
fs.writeFileSync(Path.join(module.path, 'out.txt'), JSON.stringify(graph.statedoc,'','\t'));


//console.log(JSON.stringify(config, '', '\t'));
//console.log(FOLLOW('OPERAND', all));
//console.log(FIRST('ARGS', all));

let lib = {
	com:{w:1, e:1, o:1, n:1, s:1, p:1, f:1, m:1, l:1, d:1},
	fun:{}
};

//console.log(...lexer(sample, lib));

let trans = makeTranslator(config);

let ast = trans(lexer(sample, lib));

console.log(ast);
fs.writeFileSync(Path.join(module.path, 'ast.json'), JSON.stringify(ast,'','\t'));
