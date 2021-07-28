
const {Vector, Vector2, Vector3} = require('@grunmouse/math-vector');

const extendVector = require('./extend-vector.js');

const {svgPart,psPart} = require('../render/index.js');

const Part = require('./part.js');

/**
 * Представляет одноуровневую часть связной компоненты
 */
class FlatPart extends Part{
	
	renderSVG(width){
		return svgPart(this, width, 'black');
	}
	
	renderPS(width){
		return psPart(this, width, '#000000');
	}
}

module.exports = FlatPart;