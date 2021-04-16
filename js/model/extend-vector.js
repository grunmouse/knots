
/**
 * @property radius : Number - радиус скругления точки
 * @property starting : Boolean - закрытие точки начала
 * @property ending : Boolean - закрытие точки конца
 */

const keys = ['radius', 'starting', 'ending', 'skew'];


function setprops(result, map){
	for(let key of keys){
		setprop(result, key, map[key]);
	}
	return result;
}

function setprop(result, name, value){
	if(value == null){
		delete result[name];
	}
	else{
		result[name] = value;
	}
	return result;
}

function setExistProps(result, map){
	for(let key of keys){
		if(key in map){
			setprop(result, key, map[key]);
		}
	}	
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
			setprops(result, source);
			setExistProps(result, map);
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
			setprop(result, name, value);

			return result;
		}
		
	}
}

module.exports = extendVector;