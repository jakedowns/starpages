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

// Quaternion operations
vec4 quat_from_axis_angle(vec3 axis, float angle) {
    float halfAngle = angle * 0.5;
    float s = sin(halfAngle);
    return vec4(axis * s, cos(halfAngle));
}

vec4 quat_multiply(vec4 q1, vec4 q2) {
    return vec4(
        q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
        q1.w * q2.y + q1.y * q2.w + q1.z * q2.x - q1.x * q2.z,
        q1.w * q2.z + q1.z * q2.w + q1.x * q2.y - q1.y * q2.x,
        q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z
    );
}

vec3 rotate_by_quaternion(vec3 p, vec4 q) {
    vec4 pQuat = vec4(p, 0.0);
    vec4 qConj = vec4(-q.xyz, q.w);
    vec4 rotatedQuat = quat_multiply(quat_multiply(q, pQuat), qConj);
    return rotatedQuat.xyz;
}

// fastsqrt function
float fastsqrt(float x) {
    return x * inversesqrt(x);
}

// Shader main code
void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec2 mouse = (iMouse.xy - 0.5 * iResolution.xy) / iResolution.y;
    if (iResolution.z > 1.0) {
        mouse = mod(mouse * iResolution.z, 1.0) * 2.0 - 1.0;
        mouse.x *= sign(sin(iResolution.z * PI * mouse.x));
        mouse.y *= sign(sin(iResolution.z * PI * mouse.y));
    }

    float radius = 0.01 * (abs(iMouseWheel.y) * 0.1 + 1.0);

    // Quaternion-based rotation
    float angleX = mod(iTime * 10.0, 360.0); // Rotation angle around X-axis
    float angleY = mod(iTime * 80.0, 360.0); // Rotation angle around Y-axis
    vec4 quatX = quat_from_axis_angle(vec3(1, 0, 0), radians(angleX));
    vec4 quatY = quat_from_axis_angle(vec3(0, 1, 0), radians(angleY));
    vec4 quatRot = quat_multiply(quatX, quatY);

    vec3 lightPos = rotate_by_quaternion(vec3(1, 0, 0), quatRot);
    vec3 sphereCenter = vec3(uv, 0.0);
    vec3 toLight = normalize(lightPos - sphereCenter);

    vec3 sphereNormal = normalize(vec3(uv - mouse, fastsqrt(radius*radius - dot(uv - mouse, uv - mouse))));

    float diff = max(dot(sphereNormal, toLight), 0.0);

    vec3 colorUV = diff * vec3(0.62, 0.33, 0.15);

    if(length(uv - mouse) < radius){
        gl_FragColor = vec4(colorUV, 1.0);
        gl_FragColor.a = ((gl_FragColor.r * .4) + (gl_FragColor.g * 1.3) + (gl_FragColor.b * .9)) / 3.0;
        return;
    }

    // If the pixel is not within the radius of the hemisphere, apply a default color and return
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;

/*

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
*/
}