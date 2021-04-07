

const reTokens = /([a-z][a-z\d]*)|(\d+(?:\.\d*)?|\.\d+)|(\.{3})|(\*[*/])|([*/])|([-+])|([{}\[\](),])/gi;

const types = [
	,
	'name',
	'value',
	'spreed',
	'otp',
	'otm',
	'ots'
]

/*
	1. name
	2. value
	3. spreed
	4. otp
	5. otm
	6. ots
	7. as is
*/

function *lexer(str, lib){
	reTokens.lastIndex = 0;
	let item = reTokens.exec(str);
	while(item){
		if(item[1]){
			let name = item[1];
			if(lib.com[name]){
				yield {type:'command', raw:name};
			}
			else if(lib.fun[name]){
				yield {type:'funname', raw:name};
			}
			else{
				yield {type:'varname', raw:name};
			}
		}
		else if(item[7]){
			let raw = item[7];
			yield {type:raw, raw};
		}
		else{
			for(let i=2; i<7; ++i){
				if(item[i]){
					let type = types[i];
					yield {type, raw:item[i]};
				}
			}
		}
		item = reTokens.exec(str);
	}
}

module.exports = lexer;