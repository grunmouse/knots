
const keys = ['radius', 'starting', 'ending'];


function setprops(result, map){
	for(let key in keys){
		result[key] = map[key];
	}
	return result;
}

/**
 * Клонирует объект и добавляет в него свойства
 */
function extendVector(source, name, value){
	if(typeof name === 'object'){
		let map = name;
		if(keys.every((key)=>(!(key in map) || source[key] === map[key]))){
			return source;
		}
		else{
			let result = new source.constructor(...source);
			for(let key of keys){
				if(key in map){
					result[key] = map[key];
				}
				else{
					result[key] = source[key];
				}
			}
			return result;
		}
	}
	else{
		if(source[name] === value){
			return source;
		}
		else{
			let result = new source.constructor(...source);
			setprops(result, source);
			result[name] = value;
			return result;
		}
		
	}
}

module.exports = extendVector;