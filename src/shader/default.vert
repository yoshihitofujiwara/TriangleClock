precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float progress;
uniform float time;
uniform float noise;
uniform float size;

attribute vec3 position;
attribute vec3 offset;
attribute vec3 nextOffset;
attribute vec4 rotate;
attribute vec4 color;

varying vec3 vPosition;
varying vec4 vColor;


#pragma glslify: snoise2 = require(glsl-noise/simplex/2d);


// Quaternion
mat3 rotateQ(float angle, vec3 axis){
	vec3 a = normalize(axis);
	float s = sin(angle);
	float c = cos(angle);
	float r = 1.0 - c;
	mat3 m = mat3(
			a.x * a.x * r + c,
			a.y * a.x * r + a.z * s,
			a.z * a.x * r - a.y * s,
			a.x * a.y * r - a.z * s,
			a.y * a.y * r + c,
			a.z * a.y * r + a.x * s,
			a.x * a.z * r + a.y * s,
			a.y * a.z * r - a.x * s,
			a.z * a.z * r + c
	);
	return m;
}


void main(){
	vColor = color;

	vec4 orientation = vec4(rotate.xyz, rotate.w + time);

	vec3 basePosition = mix(offset, nextOffset, progress) + (position * size) * rotateQ(orientation.w, orientation.xyz);

	vec3 noise3D = vec3(
		snoise2(vec2(basePosition.x, time)),
		snoise2(vec2(basePosition.y, time)),
		snoise2(vec2(basePosition.z, time))
	) * noise;

	vPosition = basePosition + noise3D;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
