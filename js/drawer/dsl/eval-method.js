


function createEval(mapping){

	function eval(item, strong){
		if(!item){
			throw new Error('Item is undefined');
		}
		let type = item.type;
		let len = item.data && item.data.length
		let fun = len && mapping[type + ' ' + len] || mapping[type];
		let result;
		try{
			if(strong){
				this.strong = true;
				result = fun(this, item);
				this.strong = false;
			}
			else{
				result = fun(this, item);
			}
		}
		catch(e){
			e.message += " for " + type + " " + len;
			throw e;
		}
		
		return result;
	}
	
	return eval;
}

module.exports = createEval;