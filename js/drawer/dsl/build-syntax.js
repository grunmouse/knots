const {
	makeSyntax,
	makeTranslator
} = require('@grunmouse/syntax-lr0');

const fs = require('fs');
const Path = require('path');

const notation = fs.readFileSync(Path.join(module.path, 'syntax.txt'), {encoding:'utf8'});

const config = makeSyntax(notation);


fs.writeFileSync(Path.join(module.path, 'syntax-prod.js'), 'module.exports = ' + JSON.stringify(config) + ';');