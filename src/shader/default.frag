precision mediump float;

uniform float time;
uniform float opacity;

varying vec3 vPosition;
varying vec4 vColor;


void main() {
	vec4 color = vColor;

	color.r = vColor.r + vPosition.x / 50.0;
	color.g = vColor.g + vPosition.y / 50.0;
	color.b = vColor.b + vPosition.z / 50.0;
	color.a = opacity;

	gl_FragColor = color;
}
