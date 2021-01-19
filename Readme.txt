#Assignment 3: A Ray Tracing Application
This is a program which uses ray tracing and Phong Shading methods in order to render scene in selected sample scene file.
Language: JavaScript (WebGL Library)
Requirements: Common file which includes initShaders.js, webgl-utils.js, and MV.js files. Sample scene files which includes the information of scene.


##Usage
	Program can be used by right clicking the 'raytracer.html' file at the 'Source' file and opening it whith any browser which supports WebGL. In order this
program to work Common file which includes initShaders.js, webgl-utils.js, and MV.js have to appear in the Source file.
	In order to use program, first click the file select button under the black canvas. Then select either one of the scenes provided which are in the 'Sample Scenes' folder or 
creating new scene file according to examples in 'Sample Scenes' folder.
	In code, first we trace the rays coming from the camera. We are finding the closest intersection with this ray. First we take ray from each light sources and find that whether this point is closest intersection
of ray coming from lights. If it intersects, we illuminate this point for each light source. And we send another ray from that point which is the reflection of the ray coming from camera and keep doing this until reaching the 
maximum number of ray trace.
	We handle shiny and opaque objects in this ray tracing code. Also using this function we can create almost perfect mirrors in our scenes by making very shiny objects.
##Creating Scene Arrays
Cube--
[["cube"],center of cube,distance to sides,diffuse,specular,ambient,shineness]
Sphere--
[["sphere"],center position,radius,diffuse,specular,ambient,shineness]
Cone--
[["cone"],head point,height,radius(don't work),diffuse,specular,ambient,shineness],
Light--
[["light"],coordinates,diffuse,specular,ambient],
##Contributers
Name - Surname: Halil Özgür Demir
Bilkent ID: 21801761
Name - Surname: Serkan Delil
Bilkent ID: 21501289