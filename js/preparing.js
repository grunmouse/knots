const {
	Segment,
	functions
} = require('@grunmouse/cube-bezier');


/**
 * @param S : Array<Segment> - все сегменты плетения
 * @param face : Array<Node> - начальные узлы доступных извне путей
 */
function normalize1(S, face){
	S = [...S];
	
	let ends = face.map(a=>{
		let [_, end, close] = a.orderSegments();
		return end;
	});
	
	let exists = new Set(ends.concat(face));

	let starts = functions.groupPath(S).filter((node)=>(!exists.has(node)));
	for(let start of starts){
		start.orderSegments();
	}
	
	functions.allCrossing(S);
	let segments = functions.splitBetweenCrossing(S);
	
	return segments;
}

module.exports = {
	normalize1
};