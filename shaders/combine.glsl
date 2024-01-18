layout(location = 1) out vec4 iBuffer0;
layout(location = 2) out vec4 iBuffer1;

// Fragment shader
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform vec4 iMouseRaw;
uniform vec4 iMouseWheel;
uniform int numLights;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c) {
    float eps = 1e-10;
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = eps * 1.0e3;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main() {
    vec2 uv = gl_FragColor.xy / iResolution.xy;
    vec4 currentColor = texture2D(iChannel0, uv.xy);
    vec4 previousColor = texture2D(iChannel1, uv.xy);
    // decay
    previousColor = previousColor * 0.9999999;

    vec3 b = rgb2hsv(previousColor.rgb);
    b.x += 0.01 * iTime;
    b.x = mod(b.x, 1.0);
    vec3 c = hsv2rgb(b);
    previousColor.rgb = c;


    // gl_FragColor = currentColor + previousColor;
    // apply a "smear" effect between the two
    float smearFactor = max(0.1, 1.0 - iTime);
    vec4 smearColor = mix(previousColor, currentColor, smearFactor);
    gl_FragColor = smearColor; //iMouse.x > 0.5 ? smearColor : currentColor;
}