const mixinProp = Symbol();

class Mixin{
	constructor(descriptor, methods){
		this.descriptor = new Map(descriptor.map((item)=>{
			if(typeof item === 'string'){
				return [item, {}];
			}
			else if(Array.isArray(item)){
				return item;
			}
			else if(item && item.name){
				return [item.name, item];
			}
		}));
		this.methods = methods || [];
	}
	
	setprop(result, name, value){
		if(value == null){
			delete result[name];
		}
		else{
			result[name] = value;
		}
		return result;
	}	
	
	mergeprop(into, name, a, b){
		a = a[name];
		b = b[name];
		callback = this.descriptor.get(name).merge || ((a, b)=>(a));
		let result;
		if(!a){
			if(b != null){
				result = b;
			}
		}
		else if(!b){
			result = a;
		}
		else if(a === b){
			result = a;
		}
		else{
			result = callback(a, b);
		}
		this.doExtend(into, name, result);
	}	
	
	setExistProps(result, map){
		for(let key of this.descriptor.keys()){
			if(key in map){
				this.setprop(result, key, map[key]);
			}
		}	
	}
	
	isSetted(into, map){
		return [...this.descriptor.keys()].every((key)=>(!(key in map) || into[key] === map[key]));
	}
	
	setprops(result, map, onlyExists){
		for(let [key, config] of this.descriptor){
			if(key in map){
				this.setprop(result, key, map[key]);
			}
			else if(!onlyExists){
				let defaultValue = config.value;
				if(defaultValue.call){
					defaultValue = defaultValue();
				}
				this.setprop(result, key, defaultValue);
			}
		}	
	}
	
	addmethods(into){
		for(let [name, fun] of this.methods){
			into[name] = fun;
		}
	}
	
	doMixin(result, source){
		this.addmethods(result);
		this.setprops(result, source);	
		result[mixinProp] = this;
		return result;		
	}
	
	doClone(source){
		let result;
		if(source.clone && source.clone.call()){
			result = source.clone();
		}
		else if(Array.isArray(source)){
			result = new source.constructor(...source);
		}
		this.doMixin(result, source)
		return result;
	}
	
	/**
	 * Создаёт клон source и расширяет его переданными свойствами
	 */
	doExtend(source, name, value){
		if(typeof name === 'object'){
			let map = name;
			if(keys.every((key)=>(!(key in map) || source[key] === map[key]))){
				return source;
			}
			else{
				let result = doClone(source);
				this.setExistProps(result, map);
				return result;
			}
		}
		else{
			if(source[name] === value){
				return source;
			}
			else{
				let result = doClone(source);
				this.setprop(result, name, value);

				return result;
			}
			
		}
	}	
	
	/**
	 * Создаёт клон первого аргумента и расширяет его результатом мержа дополнительных свойств обоих аргументов
	 */
	doMerge(a, b){
		if(a === b){
			return a;
		}
		let result = this.doClone(a);
		for(let [key, config] of this.descriptor){
			this.joinParamInto(result, key, a, b);
		}
		return result;		
	}
	
	
}

Mixin.symbol = mixinProp;
Mixin.prototype.symbol = mixinProp;

module.exports = Mixin;