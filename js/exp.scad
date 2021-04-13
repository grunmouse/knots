$fn=40;

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

radius = 1;
color("#FED6BC"){
edge([0,20,0],[10,20,0]);
edge([10,20,0],[10,20,-10]);
edge([10,20,-10],[20,10,-10]);
edge([20,10,-10],[20,10,0]);
edge([20,10,0],[30,0,0]);
edge([30,0,0],[40,0,0]);
point([0,20,0]);
point([10,20,0]);
point([10,20,-10]);
point([20,10,-10]);
point([20,10,0]);
point([30,0,0]);
point([40,0,0]);
}
color("#FFFADD"){
edge([0,0,0],[10,10,0]);
edge([10,10,0],[20,20,0]);
edge([20,20,0],[30,20,0]);
edge([30,20,0],[40,10,0]);
point([0,0,0]);
point([10,10,0]);
point([20,20,0]);
point([30,20,0]);
point([40,10,0]);
}
color("#C3FBD8"){
edge([0,10,0],[0,10,-10]);
edge([0,10,-10],[10,0,-10]);
edge([10,0,-10],[10,0,0]);
edge([10,0,0],[20,0,0]);
edge([20,0,0],[20,0,-10]);
edge([20,0,-10],[30,10,-10]);
edge([30,10,-10],[40,20,-10]);
edge([40,20,-10],[40,20,0]);
point([0,10,0]);
point([0,10,-10]);
point([10,0,-10]);
point([10,0,0]);
point([20,0,0]);
point([20,0,-10]);
point([30,10,-10]);
point([40,20,-10]);
point([40,20,0]);
}