# Raytracer
Ray tracing program implemented by using WebGL

 - This is a program which uses ray tracing and Phong Shading methods in order to render scene in selected sample scene file.
 - Language: JavaScript (WebGL Library)
 - Requirements: Common file which includes initShaders.js, webgl-utils.js, and MV.js files. Sample scene files which includes the information of scene.


# Usage
 -	Program can be used by right clicking the 'raytracer.html' file at the 'Source' file and opening it whith any browser which supports WebGL. In order thisprogram to work Common file which includes initShaders.js, webgl-utils.js, and MV.js have to appear in the Source file.
 -	In order to use program, first click the file select button under the black canvas. Then select either one of the scenes provided which are in the 'Sample Scenes' folder or creating new scene file according to examples in 'Sample Scenes' folder.
 -	In code, first we trace the rays coming from the camera. We are finding the closest intersection with this ray. First we take ray from each light sources and find that whether this point is closest intersection of ray coming from lights. If it intersects, we illuminate this point for each light source. And we send another ray from that point which is the reflection of the ray coming from camera and keep doing this until reaching the  maximum number of ray trace.
 -	We handle shiny and opaque objects in this ray tracing code. Also using this function we can create almost perfect mirrors in our scenes by making very shiny objects.
# Creating Scene Arrays
 - Cube--
[["cube"],center of cube,distance to sides,diffuse,specular,ambient,shineness]
 - Sphere--
[["sphere"],center position,radius,diffuse,specular,ambient,shineness]
 - Cone--
[["cone"],head point,height,radius(don't work),diffuse,specular,ambient,shineness],
 - Light--
[["light"],coordinates,diffuse,specular,ambient],
# Contributers
 - Name - Surname: Halil Özgür Demir
 - Name - Surname: Serkan Delil

# Sample Scenes

![alt text](https://user-images.githubusercontent.com/64331421/105493114-001d4700-5cca-11eb-8f0d-67937e05664e.png)
![alt text](https://user-images.githubusercontent.com/64331421/105493126-04e1fb00-5cca-11eb-9ffb-dabab78a25f6.png)
![alt text](https://user-images.githubusercontent.com/64331421/105493139-09a6af00-5cca-11eb-9ce7-ff0d6fddb34b.png)
![alt text](https://user-images.githubusercontent.com/64331421/105493148-0dd2cc80-5cca-11eb-9d7b-2fcdae7e35fa.png)
![alt text](https://user-images.githubusercontent.com/64331421/105493162-10cdbd00-5cca-11eb-8f95-41f53ed7ae02.png)
![alt text](https://user-images.githubusercontent.com/64331421/105493170-14614400-5cca-11eb-8a71-ceaa3711df95.png)
