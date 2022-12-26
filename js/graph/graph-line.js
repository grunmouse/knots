/**
 * @typedef NodeID - любое значение, которое может служить ключём
 */


/**
 * @typedef {Array<NodeID>} NodePolyline - ломаная, соединяющая узлы в порядке их следования
 */
 
/**
 * @typedef {object} LevelStructure<P> - структура, представляющая ломаные одного уровня
 * @param {Array<P>} opened - разомкнутые ломаные
 * @param {Array<P>} closed - замкнутые ломаные
 */

/**
 * сортирует объединяет смежные рёбра в непрерывные цепочки узлов
 * @param {Array<NodePolyline>} edges - массив фрагментов линий
 * @returned LevelStructure<NodePolyline>
 */
function sortLines(edges){
	/**
	 * @var {Map<NodeID, NodePolyline>} linesMap
	 * для каждого узла, являющегося концом ломаной, содержит соответствующую ломаную
	 */
	let linesMap = new Map();
	/**
	 * @var {Array<NodePolyline>} closeLines
	 * Массив замкнутых линий
	 */
	let closeLines = [];

	/**
	 * Соединяет две линии, удаляет из мапы общий узел, если он там был
	 * @param {NodePolyline} line1
	 * @param {NodeID} node - общий узел
	 * @param {NodePolyline} line2
	 * @return {NodeID} - второй узел line2, по нему нужно добавить в мапу line1
	 * @sideeffect line1 - после работы это объединённая линия
	 * @sideeffect line2 - после работы измененена, не должна использоваться
	 * @sideeffect linesMap.delete(node) - общий узел больше не используется для идентификации фрагмента линии
	 */
	function concatTwoLines(line1, node, line2){
		if(line1[0]===node){
			if(line2[0]===node){
				//Начало к началу
				line2.reverse();
			}
			if(line2.pop()===node){
				//Конец к началу
				line1.unshift(...line2);
				linesMap.delete(node);
				
				let n2 = line1[0];

				return n2;
			}
			else{
				throw new Error("Inconsistent line "+node);
			}
		}
		else if(line1[line1.length-1]===node){
			if(line2[line2.length-1]===node){
				//Конец к концу
				line2.reverse();
			}
			if(line2.shift()===node){
				//Начало к концу
				line1.push(...line2);
				linesMap.delete(node);
				
				let n2 = line1[line1.length-1];
				
				return n2;
			}
			else{
				throw new Error("Inconsistent line "+node);
			}
		}
		else{
			throw new Error("Inconsistent line "+node);
		}
	}

	
	function convertToClosed(line){
		closeLines.push(line);
		linesMap.delete(line[0]);
		line.pop();
	}
	

	/**
	 * Находит в мапе линию, один из концов которой равен node
	 *	добавляет с соответствующего конца новый фрагмент line2
	 *  проверяет, не является ли свободный конец line2 началом ещё одной линии,
	 *  если да - то добавляет и её
	 * @param {NodeID} node
	 * @param {NodePolyline} line2
	 */
	function handle(node, line2){
		let line1 = linesMap.get(node);
		let tileNode = concatTwoLines(line1, node, line2);
		
		if(line1[0] === line[line1.length-1]){
			//Линия замкнулась после слияния
			convertToClosed(line1);
		}
		else{
			if(linesMap.has(tileNode)){
				//Найдено продолжение от нового конца
				
				let line3 = linesMap.get(tileNode);
				tileNode = concatTwoLines(line1, node, line3); //Добавляем к line1 третью часть
			}
			
			linesMap.set(tileNode, line1);
		}

	}
	
	
	//Обходит все рёбра, проверяет есть ли в мапе линии начинающиеся с одного из узлов очередного ребра,
	//	если да - то дополняет и переименовывает эту линию этим узлом
	//	если нет, то добавляет ребро в мапу как новую линию, доступную по двум индексам - номерам её узлов
	for(let e of edges){
		let first = e[0];
		let last = e[e.length-1];
		let line = [...e];
		if(linesMap.has(first)){
			handle(first, line);
		}
		else if(linesMap.has(last)){
			handle(last, line);
		}
		else{
			linesMap.set(first, line);
			linesMap.set(last, line);
		}
	}
	//После работы все замкнутые линии перенесены в closeLines, мапа содержит только разомкнутые, причем по две ссылки на каждую
	let uncloseLines = Array.from(new Set(linesMap.values()));
	return {
		closed:closeLines,
		opened:uncloseLines
	};
}

module.exports = {
	sortLines
};