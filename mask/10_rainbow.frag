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
  const int MAX_RADIUS = 40;
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
  vec3 edgeColor1 = vec3(0.9725, 0.0549, 0.0549);
  vec3 edgeColor2 = vec3(0.9765, 0.9922, 0.0157);
  vec3 edgeColor3 = vec3(0.0549, 0.9725, 0.2078);
  vec3 edgeColor4 = vec3(0.0549, 0.6039, 0.9725);

  bool inMask = maskColor > 0.5;
  bool inDilatedMask1 = dilate(u_tex1, coord, 10).r > 0.0;
  bool inDilatedMask2 = dilate(u_tex1, coord, 20).r > 0.0;
  bool inDilatedMask3 = dilate(u_tex1, coord, 30).r > 0.0;
  bool inDilatedMask4 = dilate(u_tex1, coord, 40).r > 0.0;

  bool isEdge1 = !inMask && inDilatedMask1;
  bool isEdge2 = !inMask && inDilatedMask2;
  bool isEdge3 = !inMask && inDilatedMask3;
  bool isEdge4 = !inMask && inDilatedMask4;

  vec3 color = texColor;
  if (isEdge1) {
    color = edgeColor1;
  } else if (isEdge2) {
    color = edgeColor2;
  } else if (isEdge3) {
    color = edgeColor3;
  } else if (isEdge4) {
    color = edgeColor4;
  }

  gl_FragColor = vec4(color, 1.0);
}