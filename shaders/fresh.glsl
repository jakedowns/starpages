// Comment these out to past into shadertoy
uniform float iTime;
uniform sampler2D iChannel0;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform vec4 iMouseRaw;
// define PI
const float PI = 3.1415926535897932384626433832795;
// End shadertoy global uniforms

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
    // divide the canvas into checkerboard with alternating colors 
    // > aspect ratio-corrected squares 
    // > based on iMouse position: controls frequency of x, y repeat independently
    // > demonstrates sin, cos, mod, iMouse
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
    vec2 mouse = iMouse.xy / iResolution.xy;

    // draw a bouncing ball
    if(length(uv + 0.5 - mouse) < 0.1){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
    }

    gl_FragColor = vec4(texture2D(iChannel0, uv).rgb, 1.0);
    //gl_FragColor = vec4(uv.x, uv.y, mouse.x, 1.0);
    return;

    // Increase the frequency over time to create a zooming effect
    float zoom = sin(iTime*.1) * 10. + 10.;
    float checker = mod(floor((mouse.x + zoom) * uv.x) + floor((mouse.y + zoom) * uv.y), 4.0);

    // Apply a scrolling gradient using sin and cos
    float gradient = 0.5 * (sin(iTime + uv.x) + cos(iTime + uv.y));

    vec3 hsv = vec3(gradient, 1.0, 1.0);

    // Mix the original color with the gradient
    // vec3 color = mix(vec3(1.0), vec3(0.8), checker);
    // color = mix(color, vec3(gradient), 0.5);
    // Mix the original color with the gradient
    vec3 color = mix(vec3(1.0), vec3(0.8), checker);
    color = mix(color, vec3(gradient), 0.5);
    //color = hsv2rgb(hsv);

    gl_FragColor = vec4(color, 1.0);
}