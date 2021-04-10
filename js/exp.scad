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
edge([0,0,0],[90,0,0]);
edge([90,0,0],[90,0,-10]);
edge([90,0,-10],[90,-40,-10]);
edge([90,-40,-10],[90,-40,0]);
edge([90,-40,0],[10,-40,0]);
edge([10,-40,0],[10,-40,-10]);
edge([10,-40,-10],[10,-10,-10]);
edge([10,-10,-10],[10,-10,0]);
edge([10,-10,0],[100,-10,0]);
edge([100,-10,0],[100,-10,-10]);
edge([100,-10,-10],[100,-50,-10]);
edge([100,-50,-10],[100,-50,0]);
edge([100,-50,0],[20,-50,0]);
edge([20,-50,0],[20,-50,-10]);
edge([20,-50,-10],[20,-20,-10]);
edge([20,-20,-10],[20,-20,0]);
edge([20,-20,0],[110,-20,0]);
edge([110,-20,0],[110,-20,-10]);
edge([110,-20,-10],[110,-60,-10]);
edge([110,-60,-10],[110,-60,0]);
edge([110,-60,0],[30,-60,0]);
edge([30,-60,0],[30,-60,-10]);
edge([30,-60,-10],[30,-30,-10]);
edge([30,-30,-10],[30,-30,0]);
edge([30,-30,0],[120,-30,0]);
point([0,0,0]);
point([90,0,0]);
point([90,0,-10]);
point([90,-40,-10]);
point([90,-40,0]);
point([10,-40,0]);
point([10,-40,-10]);
point([10,-10,-10]);
point([10,-10,0]);
point([100,-10,0]);
point([100,-10,-10]);
point([100,-50,-10]);
point([100,-50,0]);
point([20,-50,0]);
point([20,-50,-10]);
point([20,-20,-10]);
point([20,-20,0]);
point([110,-20,0]);
point([110,-20,-10]);
point([110,-60,-10]);
point([110,-60,0]);
point([30,-60,0]);
point([30,-60,-10]);
point([30,-30,-10]);
point([30,-30,0]);
point([120,-30,0]);
}