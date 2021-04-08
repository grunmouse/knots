const {Vector3, Vector2} = require('@grunmouse/math-vector');

const dirmap = (function(){
	const N = new Vector2(0,1);
	const W = new Vector2(-1,0);
	const S = N.neg();
	const O = W.neg();
	const map = {
		n:N,
		w:W,
		s:S,
		o:O,
		e:O
	};
	
	let lat = ['n', 's'];
	let lon = ['w', 'o', 'e'];
	let full = lat.concat(lon);
	let half = [];
	for(y of lat) for(x of lon){
		let key = y+x;
		map[key] = map[x].add(map[y]);
		half.push(key);
	}
	
	for(let f of full) for(let l of half){
		let key = f+l;
		map[key] = map[f].add(map[l]).div(2);
	}
	
	
	return map;

})();

module.exports = dirmap;