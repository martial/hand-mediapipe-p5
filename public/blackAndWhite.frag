#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform sampler2D tex0;

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  vec4 color = texture2D(tex0, st);
  
  float avg = (color.r + color.g + color.b) / 3.0;
  gl_FragColor = vec4(avg, avg, avg, 1.0);
}
