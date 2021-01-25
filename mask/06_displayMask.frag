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
  const int MAX_RADIUS = 10;
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

void main(){
  vec2 coord = gl_FragCoord.xy / u_resolution;
  vec3 texColor = texture2D(u_tex0, coord).rgb;
  float maskColor = texture2D(u_tex1, coord).r;
  vec3 green = vec3(0.9255, 0.4, 0.0941);

  bool inMask = maskColor > 0.5;
  bool inDilatedMask = dilate(u_tex1, coord, 1).r > 0.0;
  bool isEdge = !inMask && inDilatedMask;

  vec3 color = inDilatedMask 
    ? mix(texColor, green, (isEdge ? 0.95 : 0.5))
    : texColor;

  gl_FragColor = vec4(color, 1.0);
}