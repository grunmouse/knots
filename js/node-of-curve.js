
class NodeOfCurve{
	constructor(A, B, segment){
		this.A = A;
		this.B = B;
		this.segment = segment;
	}
	/**
	 * Направляющий вектор касательной к узлу
	 */
	get V(){
		let {A, B} = this;
		return B.sub(A);
	}
	/**
	 * Продолжение линии AB в сторону -V на величину s или V.
	 */
	product(N, s){
		let {A, V} = this;
		N = N || A;
		let d;
		if(s){
			d = V.ort().mul(s);
		}
		else{
			d = V;
		}
		return N.sub(d);		
	}
	
	connect(node){
		this.sibling = node;
		node.sibling = this;
	}
	
	makePath(){
		return this.segment ? this.segment.makePath(this) : '';
	}
	
	startPath(N){
		let {A, segment} = this;
		N = N || A;
		let code = 'M ' + N.join(',') + '\n' + segment.makePath(this);
		
		return code;
	}
}

module.exports = NodeOfCurve;