
/**
 * @property radius : Number - радиус скругления точки
 * @property starting : Boolean - закрытие точки начала
 * @property ending : Boolean - закрытие точки конца
 */

const keys = ['radius', 'starting', 'ending', 'skew'];
const Mixin = require('./mixin.js');

const falsy = ()=>(false);
const noop = ()=>();
const mixinVector = new Mixin(
[
	['radius', {value:0, merge:Math.min}],
	['starting', {value:false, merge:falsy}],
	['ending', {value:false, merge:falsy}],
	['skew', {merge:noop}]
],
[
	['cut', function(n){
		let result = this.constructor.prototype.cut.call(this, n);
		return this[Mixin.symbol].doMixin(result, this);
	}],
	['extend', function(...args){
		let result = this.constructor.prototype.extend.call(this, ...args);
		return this[Mixin.symbol].doMixin(result, this);		
	}]
]
);



/**
 * Клонирует объект и добавляет в него свойства точки полилинии
 */
function extendVector(source, name, value){
	return mixinVector.doExtend(source, name, value);
}

module.exports = extendVector;