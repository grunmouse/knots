


function createEval(mapping){

	function myeval(item, strong){
		if(!item){
			throw new Error('Item is undefined');
		}
		let type = item.type;
		if(!item.type){
			throw new Error('Invalid item: ' + JSON.stringify(item));
		}
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
	
	return myeval;
}

module.exports = createEval;