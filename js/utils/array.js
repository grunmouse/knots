
function cyclicSubarr(arr, index, length){
	let len = arr.length;
	while(index >= len){
		index -= len;
	}
	if(index < 0){
		index = len - index;
	}
	
	if(index + length > len){
		length = index + length - len;
		let first = arr.slice(index);
		let last = arr.slice(0, length);
		let result = first.concat(last);
		return result;
	}
	else{
		return arr.slice(index, length);
	}
}

function cyclicSplice(arr, index, deleteCount, ...items){
	let len = arr.length;
	while(index >= len){
		index -= len;
	}
	if(index<0){
		index = len - index;
	}
	
	if(deleteCount === 0){
		if(index === 0){
			arr.push(...items);
		}
		else{
			arr.splice(index, 0, ...items);
		}
		return [];
	}
	else if(index + deleteCount > len){
		deleteCount = index + deleteCount - len;
		
		if(deleteCount > index){
			deleteCount = index;
		}
		
		let first = arr.splice(index, len, ...items);
		let last = arr.splice(0, deleteCount);
		return first.concat(last);
	}
	else{
		return arr.splice(index, deleteCount, ...items);
	}
}

function extendedSubarr(arr, index, length){
	let head, body, tail, len = arr.length;
	
	if(length === 0){
		return [];
	}

	if(index>=len){
		return new Array(length).fill(undefined);
	}

	if(index < 0){
		if(length <= -index){
			return new Array(length).fill(undefined);
		}
		head = new Array(-index).fill(undefined);
		index = 0;
	}
	else{
		head = [];
	}
	
	if(index + length > len){
		tail = new Array(index + length - len).fill(undefined);
		length = len - index;
	}
	else{
		tail = [];
	}
	
	body = arr.slice(index, index+length);
	
	return head.concat(body, tail);
}

function extendedSplice(arr, index, deleteCount, ...items){
	let head, body, tail, len = arr.length;
	
	if(index<0){
		head = new Array(-index).fill(undefined);
		arr.unshift(...head);
	}
	else{
		head = [];
	}
	
	if(index + deleteCount > len){
		tail = new Array(index + length - len).fill(undefined);
		arr.pop(...tail);
	}
	else{
		tail = [];
	}
	
	index += head.length;
	
	return arr.splice(index, deleteCount, ...items);
	
}

module.exports = {
	cyclicSubarr,
	cyclicSplice,
	extendedSubarr,
	extendedSplice
};