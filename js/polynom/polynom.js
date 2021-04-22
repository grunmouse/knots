const {
	operators:{neg, add, mul, div, sub}
} = require("@grunmouse/multioperator-ariphmetic");


class Polynom{
	/**
	 * x - имя переменной
	 * a - массив коэффициентов
	 */
	constructor(x, a){
		this.x = x;
		this.a = a;
	}
	
	static monom(obj){
		let entries = Object.entries(obj);
		entries.sort((a, b)=>(+(a[0]<b[0])-(b[0]<a[0])));
		
		let result = entries.reduce(
			(koeff, [x, p])=>(
				new Polynom(x, Array.from({length:p+1}, (_, i)=>(i===p ? koeff : 0))).strip()
			), 
			1
		);
		
		return result;
	}
	
	get isZero(){
		return this.a.length === 0;
	}
	
	strip(){
		if(this.a.length>1){
			return this;
		}
		else{
			let res = this.a[0];
			if(res instanceof Polynom){
				return res.strip();
			}
			else{
				return res;
			}
		}
	}
	
	toString(){
		let str = this.a.map((a, i)=>{
			if(!a || a.isZero){
				return "";
			}
			else{
				let k = a.toString();
				if(typeof a === 'number'){
					if(a>0){
						if(a === 1){
							k = '+';
						}
						else{
							k = '+' + k;
						}
					}
					else if(a === -1){
						k = '-';
					}
				}
				else if(a instanceof Polynom){
					if(/[-+]/.test(k)){
						k = '+(' + k + ')';
					}
				}
				if(i>0){
					if(k !== '+' && k !== '-'){
						k += '*';
					}
					k += this.x;
					if(i>1){
						k += '**' + i;
					}
				}
				return k;
			}
		}).filter((a)=>(a.length)).join('');
		
		str = str.replace(/^\+/,'');
		
		return str;
	}
}

function twoMap(a, b, callback){
	let len = Math.max(a.length, b.length);
	let result = [];
	for(let i = 0; i<len; ++i){
		result[i] = callback(a[i]||0, b[i]||0, i, a, b);
	}
	return result;
}

neg.def(Polynom, (a)=>{
	return new Polynom(a.x, a.a.map((a)=>(a[neg]())));
});

neg.useName(Polynom);

add.def(Polynom, Polynom, (a, b)=>{
	if(a.x === b.x){
		let c = twoMap(a.a, b.a, (a, b)=>(a[add](b)));
		return new Polynom(a.x, c);
	}
	else if(a.x < b.x){
		let c = new Polynom(a.x, [b]);
		return a[add](c);
	}
	else if(b.x < a.x){
		let c = new Polynom(b.x, [a]);
		return b[add](c);
	}
});

add.def(Polynom, Number, (a, n)=>{
	let arr = a.a.slice(0);
	arr[0] = arr[0][add](n);
	return new Polynom(a.x, arr);
});
add.def(Number, Polynom, (n, a)=>{
	let arr = a.a.slice(0);
	arr[0] = arr[0][add](n);
	return new Polynom(a.x, arr);
});
add.useName(Polynom);

const subtrace = (a, b)=>(a[add](b[neg]()));

sub.def(Polynom, Polynom, subtrace);
sub.def(Polynom, Number, subtrace);
sub.def(Number, Polynom, subtrace);
sub.useName(Polynom);


module.exports = Polynom;