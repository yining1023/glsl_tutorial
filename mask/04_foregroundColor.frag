#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

void main(){
  vec2 coord = gl_FragCoord.xy / u_resolution;
  vec3 color = vec3(0.0);

  vec4 image = texture2D(u_tex0, coord);
  vec4 mask = texture2D(u_tex1, coord);

  // mask.r is either 0 or 1
  float maskColor = mask.r;

  vec3 foregroundColor = vec3(0.0471, 0.7098, 0.9725);
  vec3 foreground = foregroundColor * maskColor;
  vec3 background = image.rgb * (1.0 - maskColor);

  gl_FragColor = vec4(foreground + background, 1.0);
}