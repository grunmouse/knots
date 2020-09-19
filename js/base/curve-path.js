const {recursiveJoin} = require('@grunmouse/strings');

class CurvePath{
	/**
	 * @param start :Vector2
	 * @param curves : Array<Curve>
	 * @param close : Boolean
	 */
	constructor(start, curves, close){
		this.start = start;
		this.curves = curves;
		this.close = close;
	}
	
	/**
	 * отрисовывает путь в SVG-path
	 */
	toSVG(){
		let {start, curves, close} = this;
		let code = 'M ' + start.join(",")
			+ curves.map((curve)=>('c '+recursiveJoin(curve.relativeCDR(), [' ', ',']))).join(' ');
			
		if(close){
			code += 'Z';
		}
		return code;
	}

}

module.exports = CurvePath;