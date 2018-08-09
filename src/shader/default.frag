precision highp float;

uniform float time;
uniform float opacity;

varying vec3 vPosition;
varying vec4 vColor;


vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {
	vec4 color = vColor;

	color.r = vColor.r + vPosition.x / 50.0;
	color.g = vColor.g + vPosition.y / 50.0;
	color.b = vColor.b + vPosition.z / 50.0;
	color.a = opacity;

	gl_FragColor = color;
}
