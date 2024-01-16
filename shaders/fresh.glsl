// Comment these out to past into shadertoy
uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform vec4 iMouseRaw;
uniform vec4 iMouseWheel;
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
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec2 mouse = (iMouse.xy - 0.5 * iResolution.xy) / iResolution.y;
    if (iResolution.z > 1.0) {
        mouse = mod(mouse * iResolution.z, 1.0) * 2.0 - 1.0;
        mouse.x *= sign(sin(iResolution.z * PI * mouse.x));
        mouse.y *= sign(sin(iResolution.z * PI * mouse.y));
    }

    float radius = 0.01 * (abs(iMouseWheel.y) * 0.1 + 1.0);

    vec3 lightPos = vec3(mouse, 1.0);
    vec3 sphereCenter = vec3(uv, 0.0);
    vec3 toLight = normalize(lightPos - sphereCenter);

    vec3 sphereNormal = normalize(vec3(uv - mouse, sqrt(radius*radius - dot(uv - mouse, uv - mouse))));

    float diff = max(dot(sphereNormal, toLight), 0.0);

    vec3 colorUV = diff * vec3(1.0, 0.5, 0.2);

    if(length(uv - mouse) < radius){
        gl_FragColor = vec4(colorUV, 1.0);
        gl_FragColor.a = ((gl_FragColor.r * .4) + (gl_FragColor.g * 1.3) + (gl_FragColor.b * .9)) / 3.0;
        return;
    }

    // If the pixel is not within the radius of the hemisphere, apply a default color and return
    gl_FragColor = vec4(0.0, 1.0, 1.0, 0.0);
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