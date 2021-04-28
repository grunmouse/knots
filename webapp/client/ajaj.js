
function ajaj(...request){
	return fetch(...request).then((response)=>{
		if(response.ok){
			const contentType = response.headers.get('content-type');
			let data;
			if(!contentType){
				return response.status;
			}
			else if(contentType.includes('application/json')){
				return response.json();
			}
			else if(contentType.includes('text/plain')){
				return response.text();
			}
			else{
				return response.status;
			}
		}
		else{
			throw new Error(response.status);
		}
	});
}

export default ajaj;