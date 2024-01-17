// Comment these out to past into shadertoy
uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform vec4 iMouseRaw;
uniform vec4 iMouseWheel;
uniform float numLights;
uniform vec4 fxFloats;
uniform vec4 ambientLightColor;
uniform vec4 decayColor;
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
        mouse *= iMouse.z;
        // pull back to 0-1 range
        mouse += 0.5;
    }

    float radius = 0.01 * (abs(iMouseWheel.y) * 0.1 + 1.0);
    // Quaternion-based rotation
    float angleX = mod(iTime * 100.0, 360.0); // Rotation angle around X-axis
    float angleY = mod(iTime * -100.0, 360.0); // Rotation angle around Y-axis
    
    // First light
    vec4 quatX1 = quat_from_axis_angle(vec3(1, 0, 0), radians(angleX));
    vec4 quatY1 = quat_from_axis_angle(vec3(0, 1, 0), radians(angleY));
    vec4 quatRot1 = quat_multiply(quatX1, quatY1);
    vec3 sphereCenter = vec3(uv, 0.0);
    vec3 sphereNormal = normalize(vec3(uv - mouse, fastsqrt(radius*radius - dot(uv - mouse, uv - mouse))));

    vec3 lightPos1 = rotate_by_quaternion(vec3(1, 0, 0), quatRot1);
    vec3 toLight1 = normalize(lightPos1 - sphereCenter);
    float diff = max(dot(sphereNormal, toLight1), 0.0);
    vec3 colorUV1 = diff * vec3(0.62, 0.33, 0.15); // First light color

    // Second light
    vec4 quatX2 = quat_from_axis_angle(vec3(1, 0, 0), radians(angleX + 90.0)); // Change rotation for second light
    vec4 quatY2 = quat_from_axis_angle(vec3(0, 1, 0), radians(angleY + 90.0)); // Change rotation for second light
    vec4 quatRot2 = quat_multiply(quatX2, quatY2);

    vec3 lightPos2 = rotate_by_quaternion(vec3(1, 0, 0), quatRot2);
    vec3 toLight2 = normalize(lightPos2 - sphereCenter);
    diff = max(dot(sphereNormal, toLight2), 0.0);
    vec3 colorUV2 = diff * vec3(0.15, 0.33, 0.62); // Second light color

    // Third light
    vec4 quatX3 = quat_from_axis_angle(vec3(1, 0, 0), radians(angleX + 180.0)); // Change rotation for third light
    vec4 quatY3 = quat_from_axis_angle(vec3(0, 1, 0), radians(angleY + 180.0)); // Change rotation for third light
    vec4 quatRot3 = quat_multiply(quatX3, quatY3);

    vec3 lightPos3 = rotate_by_quaternion(vec3(1, 0, 0), quatRot3);
    vec3 toLight3 = normalize(lightPos3 - sphereCenter);
    diff = max(dot(sphereNormal, toLight3), 0.0);
    vec3 colorUV3 = diff * vec3(0.15, 0.62, 0.33); // Third light color

    // Incorporate ambientLightColor using a different blend than add for highlight/shadow
    colorUV1 = mix(colorUV1, ambientLightColor.rgb, ambientLightColor.a);
    colorUV2 = mix(colorUV2, ambientLightColor.rgb, ambientLightColor.a);
    colorUV3 = mix(colorUV3, ambientLightColor.rgb, ambientLightColor.a);

    // Combine the three lights
    vec3 colorUV = colorUV1;
    colorUV = colorUV1 + colorUV2 + colorUV3;

    vec3 colorNormalMap = vec3(0.0);// diff * vec3(0.27, 0.15, 0.62);
    colorNormalMap.r = sphereNormal.x * 0.5 + 0.5;
    colorNormalMap.g = sphereNormal.y * 0.5 + 0.5;
    colorNormalMap.b = sphereNormal.z * 0.5 + 0.5;

    // fxFloats.x = alphaShadow
    // fxFloats.y = mixNormals
    // fxFloats.z = clickMouseToDraw
    float doDraw = 1.;
    if(fxFloats.z > 0.){
        doDraw = 0.;
        if(iMouse.z > 0.0){
            doDraw = 1.;
        }
    }
    if(length(uv - mouse) < radius && doDraw > 0.){

        if(fxFloats.x > -1.0) {
            // gl_FragColor.a = ((gl_FragColor.r * .4) + (gl_FragColor.g * 1.3) + (gl_FragColor.b * .9)) / 3.0;
            gl_FragColor.a = ((colorUV.r) + (colorUV.g) + (colorUV.b)) / 3.0;
        }

        colorUV = mix(colorUV, colorNormalMap, fxFloats.y);

        gl_FragColor = vec4(colorUV, 1.0);


        if(fxFloats.x > 0.0) {
            // gl_FragColor = vec4(100.0,0.0,0.0, 1.0);
            // gl_FragColor.a = ((gl_FragColor.r * .4) + (gl_FragColor.g * 1.3) + (gl_FragColor.b * .9)) / 3.0;
            gl_FragColor.a = ((gl_FragColor.r) + (gl_FragColor.g) + (gl_FragColor.b)) / 3.0;
            gl_FragColor.a *= fxFloats.x;
        }else{
        //     gl_FragColor.a = 1.0;
        }
        // mix decayColor with the colorUV
        // gl_FragColor = mix(decayColor, gl_FragColor, fxFloats.x);

        return;
    }

    // If the pixel is not within the radius of the hemisphere, apply a default color and return
    gl_FragColor = decayColor;
    //gl_FragColor.a = 0.;
    if(fxFloats.x <= 0.0){
        gl_FragColor.a = 1.0;
    }
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