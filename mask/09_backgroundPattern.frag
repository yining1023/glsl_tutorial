#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

vec4 getOffsetPixel(sampler2D t, vec2 pos, vec2 offset) {
  vec2 offsetCoord = pos + offset / u_resolution.xy; 
  return texture2D(t, offsetCoord);
}

vec4 dilate(sampler2D t, vec2 pos, int radius) {
  bool erode = (radius < 0);
  if (erode) radius = -radius;
  const int MAX_RADIUS = 30;
  vec4 accumulation = erode ? vec4(vec3(1.0), 1.0) : vec4(vec3(0.0), 1.0);
  for (int dx = -MAX_RADIUS; dx < MAX_RADIUS+1; dx++) {
    if (dx < -radius || dx > radius) continue;
    for (int dy = -MAX_RADIUS; dy < MAX_RADIUS+1; dy++) {
      if (dy < -radius || dy > radius) continue;
      vec4 currSample = getOffsetPixel(t, pos, vec2(dx, dy));
      if (erode) {
        accumulation = min(accumulation, currSample);
      } else {
        accumulation = max(accumulation, currSample);
      }
    }
  }
  return accumulation;
}

float circle(vec2 position, float radius){
  return step(radius, length(position - vec2(0.5)));
}

vec2 brickTile(vec2 _st, float _zoom){
  _st *= _zoom;

  // Here is where the offset is happening
  _st.x += step(1., mod(_st.y,2.0)) * 0.5;

  return fract(_st);
}

vec3 pattern(vec2 _st, float _zoom, vec3 _circleColor, vec3 _backgroundColor) {
  _st = brickTile(_st, _zoom);
  vec3 circleColor = _circleColor * circle(_st, 0.3);
  vec3 color = _backgroundColor + circleColor;
  return color;
}

void main(){
  vec2 coord = gl_FragCoord.xy / u_resolution;
  vec3 texColor = texture2D(u_tex0, coord).rgb;
  float maskColor = texture2D(u_tex1, coord).r;
  vec3 edgeColor = vec3(1., 1.0, 1.0);

  vec3 backgroundColor = vec3(0.902, 0.5961, 0.102);
  vec3 circleColor = vec3(0.902, 0.2, 0.2);

  vec3 background = pattern(coord, 40.0, circleColor, backgroundColor);

  bool inMask = maskColor > 0.5;
  bool inDilatedMask = dilate(u_tex1, coord, 20).r > 0.0;
  bool isEdge = !inMask && inDilatedMask;

  vec3 color = inMask ? texColor : (isEdge ? edgeColor : background);

  gl_FragColor = vec4(color, 1.0);
}