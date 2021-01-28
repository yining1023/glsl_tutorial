#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float circle(vec2 position, float radius){
  return step(radius, length(position - vec2(0.5)));
}

vec2 brickTile(vec2 _st, float _zoom){
  _st *= _zoom;

  // Here is where the offset is happening
  _st.x += step(1., mod(_st.y,2.0)) * 0.5;

  return fract(_st);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  vec3 color = vec3(0.0);

  // Apply the brick tiling
  st = brickTile(st, 20.0);

  vec3 backgroundColor = vec3(0.902, 0.5961, 0.102);

  vec3 circleColor = vec3(0.902, 0.2, 0.2) * circle(st, 0.3);

  color = backgroundColor + circleColor;

  gl_FragColor = vec4(color, 1.0);
}
