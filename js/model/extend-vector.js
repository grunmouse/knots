
/**
 * @property radius : Number - радиус скругления точки
 * @property starting : Boolean - закрытие точки начала
 * @property ending : Boolean - закрытие точки конца
 */

const keys = ['radius', 'starting', 'ending'];


function setprops(result, map){
	for(let key of keys){
		result[key] = map[key];
	}
	return result;
}

/**
 * Клонирует объект и добавляет в него свойства точки полилинии
 */
function extendVector(source, name, value){
	if(typeof name === 'object'){
		let map = name;
		if(keys.every((key)=>(!(key in map) || source[key] === map[key]))){
			return source;
		}
		else{
			let result = new source.constructor(...source);
			console.log(result);
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