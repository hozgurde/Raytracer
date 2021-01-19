// Modified from hatImage1.js in Chapter 7

"use strict";
var de = 0;
var MAX_RAY_TRACE = 8;
var MIRROR = 1000;

var epsilon = 0.0001;

var viewRadius = 150;


var lastPos = [0, 0, 1];

var imageSize = 512// 512

// Create image data
// Here i used Uint8ClampedArray instead of Uint8Array so that it is clamped.
// * 3 is for dimension
var image = new Uint8ClampedArray(imageSize * imageSize * 3);

// Texture coords for quad
var canvas;
var gl;

var program;

var texture;

var backgroundColor = [0.0, 0.0, 0.0]; //Background color is black

var sampleLightSource = [ vec3(0.0, 1.0, -1.0), vec3(1.0,1.0,1.0), vec3(1.0,1.0, 1.0), vec3(0.1, 0.1, 0.1)]; // center, diffuse, specular, ambient

var sampleLightSource2 = [ vec3(0.0, -1.5, -1.0), vec3(1.0,1.0,1.0), vec3(1.0,1.0, 1.0), vec3(0.1, 0.1, 0.1)];

var lightSources = []; //array for light sources

var sampleSphere = [ vec3(-1,-1.5,-1), 0.5, vec3(1.0, 1.0, 1.0), vec3(1.0, 0.8, 0.0), vec3(1.0, 1.0, 0.0), 10.0]; // center, radius, diffuse, specular, ambient

var sampleSphere2 = [ vec3(0,0,0), 1.0, vec3(1.0,1.0,1.0), vec3(1.0,0.8,0.0), vec3(1.0,1.0,0.0), 10.0];

var spheres = [] //array for spheres


var polygons = []; // array for polygons

var sampleCone = [vec3(0,-1,-0.5), 0.5, 1.0, vec3(1.0,1.0,1.0), vec3(1.0,0.0,1.0), vec3(0.5,0.5,0.5), 100.0];// head, height, radius, diffuse, specular, ambient

var cones = []; // array for cones

var sampleCube = [vec3(1, -1.5, -1), 0.5, vec3(1, 1, 1), vec3(1.0, 0.2, 0), vec3(0.5, 0, 0), 200.0];

var cubes = []; // array for cubes



// Ray tracing function
function raytrace()
{
	// raytrace for each pixel in canvas
    for (var y = 0; y < imageSize; ++y)
    {
        for (var x = 0; x < imageSize; ++x)
        {
			var ray = [ scale( viewRadius, lastPos ), normalize(vec3(200*x/imageSize-100, -200*y/imageSize+100, -100) )]; //create rays from viewer, viewer position = vec3(0,0,2), canvas is 4 length square centered at (0,0,0)
			
			//console.log(ray);
			
            // Get a random color
            var color = trace(ray); // start ray tracing for current pixel
			

			
            // Trace Here

            // Set color values
            image[(y * imageSize + x) * 3 + 0] = 255 * color[0];
            image[(y * imageSize + x) * 3 + 1] = 255 * color[1];
            image[(y * imageSize + x) * 3 + 2] = 255 * color[2];
        }
    }
}

function trace(ray,times){ //trace the ray
	var objectPoint = closestIntersection(ray); //find closest intersection among all the intersections
	if(objectPoint) return shade(objectPoint, ray); //if there is intersection shade that point
	else return backgroundColor; // if there is no intersection turn black
}

function closestIntersection(ray){
	var minDist;
	var minIndex;
	var intersections = []; //found intersections are stored at intersections array
	//Find all sphere intersections
	for(var i = 0; i < spheres.length; i++){
		findSphereIntersections(ray,spheres[i],intersections);
	}
	//Find all polygon intersections
	for(var i = 0; i < polygons.length; i++){
		findPolygonIntersections(ray,polygons[i],intersections);
	}
	//Find all cone intersections
	for(var i = 0; i < cones.length; i++){
		findConeIntersections(ray,cones[i],intersections);
	}
	//console.log("all intersections" + intersections[0][0]);
	if(intersections.length > 0){
		//console.log("entered");
		minDist = 999999.0;
		minIndex = -1;
		for(var i = 0; i < intersections.length;i++){//look for values of all intersected points
			if(intersections[i][0] < minDist  &&  intersections[i][0] >0 && intersections[i][0] > epsilon){ //Check if point is valid and more close to start of ray
				minDist = intersections[i][0];
				minIndex = i;
			}
		}			
	}
	else //there is no intersection
		return false;
	if(minIndex == -1) // there is no intersection in front of ray
		return false;
	return intersections[minIndex]; // return closest intersection
}

//function for finding sphere intersections
function findSphereIntersections(ray, sphere, intersections){
	var pn = subtract (ray[0], sphere[0]); // pn = head of ray - center of sphere
	var B = 2 * dot(ray[1], pn); // B value in equation
	var C = dot(pn,pn) - sphere[1] * sphere[1]; // C value in equation
	var delta = B * B - 4 * C;
	if(delta > 0){//if delta > 0 there must be two intersections
		var t =(-B + Math.sqrt(delta)) / 2;// distance to that point
		var p =add(ray[0], scale(t, ray[1] )); // coordinates of that point
		var n = scale(1/sphere[1], subtract(p, sphere[0]) ); // normal of that point
		var i = [t,n,p, sphere[2], sphere[3], sphere[4], sphere[5]]; //return all the properties of intersection [distance,normal,point,diffuse,specular,ampient,shininess]
		intersections.push(i);
		//Same operations for second point
		t =(-B - Math.sqrt(delta)) / 2;
		p =add(ray[0], scale(t, ray[1] ));
		n = scale( 1/sphere[1], subtract(p, sphere[0]));
		i = [t,n,p, sphere[2], sphere[3], sphere[4], sphere[5]];
		intersections.push(i);
	}
	else return;
}

//function for finding intersections for polygons
function findPolygonIntersections(ray, polygon, intersections){
	var v1 = subtract(polygon[0][1],polygon[0][0]);
	var v2 = subtract(polygon[0][2],polygon[0][0]);
	var n = normalize(cross(v1,v2)); //find normal to the surface
	var c = -dot(polygon[0][0], n); //find c value in plane ray intersection equation
	var t = -(dot(ray[0], n) + c) / dot(ray[1], n); // distance from point
	var p = add(ray[0], scale(t, ray[1])); // intersected point on plane
	//calculating barycentric coordinates
	var A1 = length(cross(subtract(polygon[0][1], p),subtract(polygon[0][0], p))) / 2; //first Area of triangle with new point
	var A2 = length(cross(subtract(polygon[0][2], p),subtract(polygon[0][1], p))) /2 ;//second Area of triangle with new point
	var A3 = length(cross(subtract(polygon[0][0], p),subtract(polygon[0][2], p)))/2;//third Area of triangle with new point
	var AT = length(cross(v1,v2))/2; //Area of initial triangle
	if(A1+A2+A3-AT < epsilon){ //if areas are equal, point is on the polygon
		var i = [t,n,p,polygon[1], polygon[2], polygon[3], polygon[4] ];
		intersections.push(i);
	}
	
	
}

//function for finding intersections for cones
function findConeIntersections(ray, cone, intersections){
	//head of ray - head of cone for all axis
	var Pnx = ray[0][0] - cone[0][0]; 
	var Pny = ray[0][1] - cone[0][1];
	var Pnz = ray[0][2] - cone[0][2];
	var A = ray[1][0] * ray[1][0] + ray[1][2] * ray [1][2] - ray[1][1] * ray[1][1];//A component in intersection equation
	var B = 2*(Pnx * ray[1][0] + Pnz * ray[1][2] - Pny * ray[1][1]);//B component in intersection equation
	var C = Pnx * Pnx - Pny * Pny + Pnz * Pnz;//C component in intersection equation
	var delta = B * B - 4 * A * C;
	if(delta > 0){//If delta > 0 there are 2 intersecting points
		var t =(-B + Math.sqrt(delta)) / (2 * A); //find distance
		var p =add(ray[0], scale(t, ray[1] )); // find intersecting point

		if(p[1] < cone[0][1] && p[1] > cone[0][1] - cone[1]){ //check whether point is in the limits of the cone
			var np = subtract(p, cone[0]); // carry head of cone to origin
			var n = normalize(vec3(np[0],-np[1],np[2])); //normal of point
			var i = [t,n,p, cone[3], cone[4], cone[5], cone[6]]; // push intersection with its components
			intersections.push(i);
		}
		//do same for other intersecting point
		t =(-B - Math.sqrt(delta)) / (2 * A);
		p =add(ray[0], scale(t, ray[1] ));
		if(p[1] < cone[0][1] && p[1] > cone[0][1] - cone[1]){
			var np = subtract(p, cone[0]);
			var n = normalize(vec3(np[0],-np[1],np[2])); //normal of point
			var i = [t,n,p,  cone[3], cone[4], cone[5],cone[6]];
			intersections.push(i);
		}
	}
	
	//find intersection with circle under the cone
	var t = (cone[0][1] - cone[1] -ray[0][1] )/ ray[1][1]; //find distance
	var p = add(ray[0], scale(t, ray[1] )); //find point in plane
	if( (p[0]-cone[0][0] ) * (p[0]-cone[0][0] ) + (p[2] - cone[0][2]) * (p[2] - cone[0][2]) <= (p[1] - cone[0][1]) * (p[1] - cone[0][1]) ){//check whether point is in the circle
		var i = [t,vec3(0,-1,0),p,  cone[3], cone[4], cone[5],cone[6]];
		intersections.push(i);
	}
	
}

function shade(point, ray){
	var partialColor = addLight(point, ray, 0); //add light to point by not mixing diffuse, specular and ambient components
	
	var emited = add(partialColor[0], add(partialColor[1], partialColor[2])); //mix colors
	//check whether components are larger than 1. If larger make them 1.
	emited[0] = Math.min(emited[0], 1.0);
	emited[1] = Math.min(emited[1], 1.0);
	emited[2] = Math.min(emited[2], 1.0);
	return emited;
}

function addLight(point, ray, count){ // Phong Shading
	
	var s = vec3(0,0,0); //specular component
	var d = vec3(0,0,0); //diffuse component
	var n = point[1]; //normal
	var v = scale(-1,ray[1]) //viewer
	var a = vec3(0,0,0); // ambient component
	for(var i = 0; i < lightSources.length; i++){ //illuminate for each light source
		var l = normalize(subtract(point[2], lightSources[i][0])) ; //light
		var lightRay = [lightSources[i][0], l]; //light ray coming from source
		var lightInter = closestIntersection(lightRay); // find closest intersection of that ray
		a = add(mult(point[5], lightSources[i][3]),a); // add ambient light of that light
		var xEq;
		var yEq;
		var zEq;
		//console.log(lightInter);
		//console.log("point "  + point[2]);
		if(lightInter){//check shade for every light source
			xEq = lightInter[2][0] - point[2][0] <= epsilon && lightInter[2][0] - point[2][0] >= -epsilon;
			yEq = lightInter[2][1] - point[2][1] <= epsilon && lightInter[2][1] - point[2][1] >= -epsilon;
			zEq = lightInter[2][2] - point[2][2] <= epsilon && lightInter[2][2] - point[2][2] >= -epsilon;
		}
		else{
			xEq = false	;
			yEq = false;
			zEq = false; 
		}


		if(xEq && yEq && zEq){ //if not in shadow
			var disCoef = Math.max((lightInter[0]) * (lightInter[0])/5000, 1.0); //distance coefficient in order to get smooth shades
			l = normalize(subtract(lightSources[i][0], point[2] )); //change light vectors direction in order to make calculations
			var h = normalize(add(l,v)); //halfway vector
			d = add(d,scale(1/disCoef,scale(Math.max(0.0,dot(l,n)), mult(point[3], lightSources[i][1]) ))); // add diffuse component
			s = add(s,scale(1/disCoef,scale(Math.pow(Math.max(dot(n,h),0.0),  point[6]), mult(point[4], lightSources[i][2])))); //add specular component 
			
		}
	}
	
	//calculation of reflected ray if not reached maximum ray trace
	if(count < MAX_RAY_TRACE){
		//console.log(n);
		//console.log(v);
		var reflectedDir = normalize(subtract(scale(2*dot(n, v), n),v)); //find reflected direction
		var reflectedPoint = closestIntersection([point[2], reflectedDir]); //find where the reflected ray is coming from
		var traceCoef = Math.max(1,(reflectedPoint[0]) * (reflectedPoint[0])/100/point[6]); //absorb some of the light at each step of ray tracing
		if(reflectedPoint){//if there is reflected point, find the light coming from them
			var reflectedColor = addLight(reflectedPoint,[point[2], reflectedDir], count+1); //recursion
			d = add(d,scale(1/traceCoef,scale(Math.max(0.0,dot(reflectedDir,n)), mult(point[3], reflectedColor[0]) ))); // add diffuse component
			s = add(s,scale(1/traceCoef,scale(Math.pow(Math.max(dot(n,n),0.0),  point[6]), mult(point[4], reflectedColor[1])))); //add specular component 
		}
		
	}

	return [d,s,a];
}

//function for drawing cube using center of the cube and distance from its center to sides
function drawCube(center, distance, spec, diff, ambient, shineness){
	var p1 = add(center, vec3(distance,distance,-distance));
	var p2= add(center, vec3(-distance,distance,-distance))
	var p3= add(center, vec3(-distance,distance,distance))
	var p4= add(center, vec3(distance,distance,distance))
	var p5= add(center, vec3(distance,-distance,-distance))
	var p6= add(center, vec3(-distance,-distance,-distance))
	var p7= add(center, vec3(-distance,-distance,distance))
	var p8= add(center, vec3(distance,-distance,distance))
	drawSquare(p1,p2,p3,p4, spec, diff, ambient, shineness);
	drawSquare(p1,p5,p6,p2, spec, diff, ambient, shineness);
	drawSquare(p1,p4,p8,p5, spec, diff, ambient, shineness);
	drawSquare(p7,p8,p4,p3, spec, diff, ambient, shineness);
	drawSquare(p7,p6,p5,p8, spec, diff, ambient, shineness);
	drawSquare(p7,p3,p2,p6, spec, diff, ambient, shineness);
}

//function for drawing squares by using 4 points of the square
function drawSquare(point1,point2,point3,point4,spec, diff, ambient, shineness){
	polygons.push([[point1,point2,point3], spec, diff, ambient, shineness]);
	polygons.push([[point3, point4, point1], spec, diff, ambient, shineness]);
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], 1.0 );
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var pointsArray = [];
    var texCoordsArray = [];

    // Use a quad to render texture 
    pointsArray.push(vec2(-1, -1));
    pointsArray.push(vec2(-1, 1));
    pointsArray.push(vec2(1, 1));
    pointsArray.push(vec2(1, -1));

    texCoordsArray.push(vec2(0, 0));
    texCoordsArray.push(vec2(0, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 0));

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	//drawCube(vec3(1,-1.5,-1), 0.5, vec3(1,1,1), vec3(1.0,0.2,0), vec3(0.5,0,0), 200.0);


    // Set up texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	gl.clear( gl.COLOR_BUFFER_BIT );
    //render();
}


function render() {

	
    gl.clear( gl.COLOR_BUFFER_BIT );
	drawScene();
	raytrace();
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,    // target
        0,                // level
        gl.RGB,           // image format 
        imageSize,        // width
        imageSize,        // height
        0,                // Border
        gl.RGB,           // Format
        gl.UNSIGNED_BYTE, // type
        image             // Data source
    );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
	
	cubes = [];
	spheres = [];
	cones = [];
	lightSources = [];
	polygons = [];

}

function drawScene(){
	var p1 = vec3(100,100,-100);
	var p2 = vec3(-100,100,-100);
	var p3 = vec3(-100,100,100);
	var p4 = vec3(100,100,100);
	var p5 = vec3(100,-100,-100);
	var p6 = vec3(-100,-100,-100);
	var p7 = vec3(-100,-100,100);
	var p8 = vec3(100,-100,100);
	drawSquare(p1,p4,p3,p2,vec3(1.0,1.0,1.0), vec3(1.0,0.0,0.0), vec3(1.0,0.0,0.0), 2.0);
	drawSquare(p1,p5,p8,p4,vec3(1.0,1.0,1.0), vec3(1.0,1.0,0.0), vec3(1.0,1.0,0.0), 2.0);
	drawSquare(p7,p8,p5,p6,vec3(1.0,1.0,1.0), vec3(0.0,1.0,0.0), vec3(0.0,1.0,0.0), 2.0);
	drawSquare(p3,p7,p6,p2,vec3(1.0,1.0,1.0), vec3(0.0,1.0,1.0), vec3(0.0,1.0,1.0), 2.0);
	drawSquare(p1,p2,p6,p5,vec3(1.0,1.0,1.0), vec3(1.0,1.0,1.0), vec3(1.0,0.0,1.0), 2.0);
}

//loads the selected files and calls loadPolygon method.
function loadOnClick() {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		var fileSelected = document.getElementById('txtfiletoread');
		fileSelected.addEventListener('change', function (e) {
			var fileTobeRead = fileSelected.files[0];
			//Initialize the FileReader object to read the 2file
			var fileReader = new FileReader();
			fileReader.onload = function (e) {
				loadPolygon(fileReader.result);
			};
			fileReader.readAsText(fileTobeRead);

		}, false);
	} else {
		alert("Files are not supported");
	}
}

//sets informations according to information in txt files.
function loadPolygon(a) {
	var result = JSON.parse(a);
	console.log(result)
	for (var i = 0; i < result.length; i++) {
		console.log(i);
		if (result[i][0][0] === "light") {
			sampleLightSource = [vec3(result[i][1][0], result[i][1][1], result[i][1][2]),
				vec3(result[i][2][0], result[i][2][1], result[i][2][2]),
				vec3(result[i][3][0], result[i][3][1], result[i][3][2]),
				vec3(result[i][4][0], result[i][4][1], result[i][4][2])];
			lightSources.push(sampleLightSource);
		} else if (result[i][0][0] === "sphere") {
			sampleSphere = [vec3(result[i][1][0], result[i][1][1], result[i][1][2]),
				result[i][2][0],
				vec3(result[i][3][0], result[i][3][1], result[i][3][2]),
				vec3(result[i][4][0], result[i][4][1], result[i][4][2]),
				vec3(result[i][5][0], result[i][5][1], result[i][5][2]),
				result[i][6][0]];
			spheres.push(sampleSphere);
		} else if (result[i][0][0] === "cone") {
			sampleCone = [vec3(result[i][1][0], result[i][1][1], result[i][1][2]),
				result[i][2][0],
				result[i][3][0],
				vec3(result[i][4][0], result[i][4][1], result[i][4][2]),
				vec3(result[i][5][0], result[i][5][1], result[i][5][2]),
				vec3(result[i][6][0], result[i][6][1], result[i][6][2]),
				result[i][7][0]];
			cones.push(sampleCone);
		} else if (result[i][0][0] === "cube") {
			sampleCube = [vec3(result[i][1][0], result[i][1][1], result[i][1][2]),
				result[i][2][0],
				vec3(result[i][3][0], result[i][3][1], result[i][3][2]),
				vec3(result[i][4][0], result[i][4][1], result[i][4][2]),
				vec3(result[i][5][0], result[i][5][1], result[i][5][2]),
				result[i][6][0]];
			cubes.push(sampleCube);
		}
	}
	for(var i = 0; i < cubes.length; i++){
		drawCube(cubes[i][0],cubes[i][1],cubes[i][2],cubes[i][3],cubes[i][4],cubes[i][5]);
	}
	render();
}