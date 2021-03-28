function eps(body, area){
	let [A, B] = area;
	let size = B.sub(A);
	
	let box = [A.x, A.y, B.x, B.y].join(' ');
	
	let code = `%!PS-Adobe-3.0 EPSF-3.0
%%Pages: 1
%%DocumentData: Clean7Bit
%%LanguageLevel: 2
%%BoundingBox: ${box}
%%EndComments
%%BeginProlog
save
%%EndProlog
%%BeginSetup
%%EndSetup
%%Page: 1 1
%%BeginPageSetup
%%PageBoundingBox: ${box}
%%EndPageSetup
${body}
showpage
%%Trailer
restore
%%EOF
`;

	return code;
}

module.exports = {
	eps
};