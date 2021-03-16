const {Vector3} = require('@grunmouse/math-vector');

class TwoLevelDiagram{
	init(){
		//Array<Array<Vector3>>
		this.components = [];
		this.z = 1;
		//this.pos = new Vector3(0,0,1);
	}
	
	get lastComponent(){
		return this.components[this.components.length-1];
	}
	
	get lastPoint(){
		const components = this.components;
		let i = this.components.length-1;
		while(components[i].length === 0){
			--i;
		}
		const component = components[i];
		if(component){
			return component[component.length-1];
		}
	}
	
	extPoint(point){
		return new Vector3(point[0], point[1], this.z);
	}
	
	addPoint(d){
		const prev = this.lastPoint;
		if(!prev){
			throw new Error('Not specified last point');
		}
		return prev.add(new Vector3(d[0], d[1], 0));
	}
	
	M(point){
		this.components.push([this.extPoint(point)]);
	}
	
	m(d){
		this.components.push([this.addPoint(d)]);
	}
	
	L(p){
		this.lastComponent.push(this.extPoint(p));
	}

	l(d){
		this.lastComponent.push(this.addPoint(d));
	}
	
	up(){
		if(this.z === 0){
			this.z = 1;
			const prev = this.lastPoint;
			if(prev){
				this.L(prev);
			}
		}
	}
	down(){
		if(this.z === 1){
			this.z = 0;
			const prev = this.lastPoint;
			if(prev){
				this.L(prev);
			}
		}
	}
}

module.exports = TwoLevelDiagram;