const {
	makeSyntax,
	makeTranslator
} = require('@grunmouse/syntax-lr0');

const fs = require('fs');
const Path = require('path');

const notation = fs.readFileSync(Path.join(module.path, 'syntax.txt'), {encoding:'utf8'});

const config = makeSyntax(notation);

/**
 * Объединяет леворекурсивную пару нетерминалов, сливая их data в общий массив
 * Например ARGLIST(ARGLIST(ARG), ARG) => ARGLIST(ARG, ARG)
 */
const toConcat = (type, data)=>{
	if(data.length>1 && data[0].type === type){
		data = data[0].data.concat(data.slice(1));
	}
	return data;
};

/**
 * Объединяет леворекурсивную тройку нетерминалов, исключая средний, сливая их data в общий массив
 * Например ARGLIST(ARGLIST(ARG), comma, ARG) => ARGLIST(ARG, ARG)
 */
const toCommaConcat = (type, data)=>{
	if(data.length>2 && data[0].type === type){
		data = data[0].data.concat(data.slice(2));
	}
	return data;
}


const strip = (type, data)=>{
	//console.log(type, data);
	if(data.length === 1 && data[0].data && data[0].data.length===1){
		data = data[0].data;
	}
	return data;
}

const stripTwo = (type, data)=>{
	//console.log(type, data);
	if(data.length === 2 && data[1].data && data[1].data.length===1){
		data[1] = data[1].data[0];
	}
	return data;
}

const special = {
	'PROG':(type, data)=>{
		data = toConcat(type,data);
		data = data.map((a)=>(a.type==='S' ? a.data[0] : a));
		return data;
	},
	'ARGS':(type, data)=>{
		data = toCommaConcat(type,data);
		data = data.map((a)=>(a.type==='SUBARGS' ? a.data[0] : a));
		return data;
	},
	'EXP':strip,
	'SUMM':strip,
	'SUMMAND':strip,
	'MULT':strip,
	'MULTIPLIER':strip,
	'POW':strip,
	'BASE':strip,
	'OPERAND':strip,
	'SIGNED':stripTwo
	
}

let trans = makeTranslator(config, special);

module.exports = trans;