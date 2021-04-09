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
edge([0,0,0],[10,0,0]);
edge([10,0,0],[15,0,0]);
edge([15,0,0],[15,0,10]);
edge([15,0,10],[20,0,10]);
edge([20,0,10],[25,5,10]);
edge([25,5,10],[27.5,7.5,10]);
edge([27.5,7.5,10],[27.5,7.5,0]);
edge([27.5,7.5,0],[30,10,0]);
edge([30,10,0],[35,5,0]);
edge([35,5,0],[37.5,2.5,0]);
edge([37.5,2.5,0],[37.5,2.5,10]);
edge([37.5,2.5,10],[40,0,10]);
edge([40,0,10],[45,5,10]);
edge([45,5,10],[50,10,10]);
edge([50,10,10],[55,10,10]);
edge([55,10,10],[55,10,0]);
edge([55,10,0],[60,10,0]);
edge([60,10,0],[60,0,0]);
edge([60,0,0],[60,-10,0]);
edge([60,-10,0],[35,-10,0]);
edge([35,-10,0],[35,-10,10]);
edge([35,-10,10],[10,-10,10]);
edge([10,-10,10],[10,0,10]);
edge([10,0,10],[10,10,10]);
edge([10,10,10],[15,10,10]);
edge([15,10,10],[15,10,0]);
edge([15,10,0],[20,10,0]);
edge([20,10,0],[25,5,0]);
edge([25,5,0],[27.5,2.5,0]);
edge([27.5,2.5,0],[27.5,2.5,10]);
edge([27.5,2.5,10],[30,0,10]);
edge([30,0,10],[35,5,10]);
edge([35,5,10],[37.5,7.5,10]);
edge([37.5,7.5,10],[37.5,7.5,0]);
edge([37.5,7.5,0],[40,10,0]);
edge([40,10,0],[45,5,0]);
edge([45,5,0],[50,0,0]);
edge([50,0,0],[55,0,0]);
edge([55,0,0],[55,0,10]);
edge([55,0,10],[60,0,10]);
edge([60,0,10],[70,0,10]);
point([0,0,0]);
point([10,0,0]);
point([15,0,0]);
point([15,0,10]);
point([20,0,10]);
point([25,5,10]);
point([27.5,7.5,10]);
point([27.5,7.5,0]);
point([30,10,0]);
point([35,5,0]);
point([37.5,2.5,0]);
point([37.5,2.5,10]);
point([40,0,10]);
point([45,5,10]);
point([50,10,10]);
point([55,10,10]);
point([55,10,0]);
point([60,10,0]);
point([60,0,0]);
point([60,-10,0]);
point([35,-10,0]);
point([35,-10,10]);
point([10,-10,10]);
point([10,0,10]);
point([10,10,10]);
point([15,10,10]);
point([15,10,0]);
point([20,10,0]);
point([25,5,0]);
point([27.5,2.5,0]);
point([27.5,2.5,10]);
point([30,0,10]);
point([35,5,10]);
point([37.5,7.5,10]);
point([37.5,7.5,0]);
point([40,10,0]);
point([45,5,0]);
point([50,0,0]);
point([55,0,0]);
point([55,0,10]);
point([60,0,10]);
point([70,0,10]);
}