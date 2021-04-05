
function scad(body){
	let code = `$fn=40;

function vectorLength(v1,v2) = sqrt(
    (v2[0]-v1[0])*(v2[0]-v1[0])+
    (v2[1]-v1[1])*(v2[1]-v1[1])+
    (v2[2]-v1[2])*(v2[2]-v1[2]));

function lookAt(v1, v2) =
    let(v = v2-v1)
    [
       0,
       acos(v[2]/vectorLength(v1,v2)),
       atan2(v[1], v[0])
    ];


module edge(p1,p2)
{
    translate(p1)
    rotate(lookAt(p1,p2))
    cylinder(vectorLength(p1,p2),radius,radius);
}

module point(p){
    translate(p) sphere(radius);
}

${body}`;
	
	return code;

}

module.exports = {scad};