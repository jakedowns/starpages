// Comment these out to past into shadertoy

uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2; // normal map
uniform sampler2D iChannel3; // user upload
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform vec4 iPrevMouse;
uniform vec4 iMouseRaw;
uniform vec4 iMouseWheel;
uniform vec4 fxFloats;
uniform vec4 fxFloats2;
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

float invstep(float edge, float x) {
    return 1.0 - step(edge, x);
}

// Shader main code
void main_inner(vec2 uv, vec2 mouse) {

    float radius = clamp(abs(iMouseWheel.y * 0.01),-1.,1.);
    vec3 sphereCenter = vec3(uv, 0.0);
    vec3 sphereNormal = normalize(vec3(uv - mouse, fastsqrt(radius*radius - dot(uv - mouse, uv - mouse))));
    
    // Quaternion-based rotation
    float angleX = mod(iTime * 100.0, 360.0); // Rotation angle around X-axis
    float angleY = mod(iTime * -100.0, 360.0); // Rotation angle around Y-axis
    
    

    // define 3 moons rotating around our sphere
    vec3 center1 = vec3(0.5, 0.5, 0.0);
    float radius1 = 0.1;
    vec3 center2 = vec3(0.5, 0.5, 0.0);
    float radius2 = 0.1;
    vec3 center3 = vec3(0.5, 0.5, 0.0);
    float radius3 = 0.1;

    // affect the rotation and offset of the moons based on time
    float time = iTime * 0.1;
    float spacing = 10.0;
    // center1.x += sin(time) * spacing;
    // center1.y += cos(time) * spacing;
    // center2.x += sin(time + 1.0) * spacing;
    // center2.y += cos(time + 1.0) * spacing;
    // center3.x += sin(time + 2.0) * spacing;
    // center3.y += cos(time + 2.0) * spacing;
    // // and their radius
    // radius1 += sin(time) * 0.05;
    // radius2 += sin(time + 1.0) * 0.05;
    // radius3 += sin(time + 2.0) * 0.05;
    
    // First light
    vec4 quatX1 = quat_from_axis_angle(vec3(1, 0, 0), radians(angleX));
    vec4 quatY1 = quat_from_axis_angle(vec3(0, 1, 0), radians(angleY));
    vec4 quatRot1 = quat_multiply(quatX1, quatY1);

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
    // Third light color
    vec3 colorUV3 = diff * vec3(0.15, 0.62, 0.33); 
    
    // Incorporate ambientLightColor using a different blend than add for highlight/shadow
    // colorUV1 = mix(colorUV1, ambientLightColor.rgb, ambientLightColor.a);
    // colorUV2 = mix(colorUV2, ambientLightColor.rgb, ambientLightColor.a);
    // colorUV3 = mix(colorUV3, ambientLightColor.rgb, ambientLightColor.a);

    vec3 sphereSurface = sphereCenter + sphereNormal * radius;
    sphereSurface = vec3(uv, 0.0) + sphereNormal * radius;
    vec3 toLight4 = normalize(sphereSurface - sphereCenter);
    diff = max(dot(sphereNormal, toLight4), 0.0);
    vec4 colorUserInput = texture2D(iChannel3, gl_FragCoord.xy / iResolution.xy);
    vec3 colorUV4 = colorUserInput.rgb; // todo * diff

    //Combine the three lights
    vec3 colorUV = colorUV1 * step(0.0, fxFloats.w) + colorUV2 * step(0.3, fxFloats.w) + colorUV3 * step(0.6, fxFloats.w);

    // colorUV += colorUV4;
    // colorUV = colorUV4;

    vec3 colorNormalMap = vec3(0.0);// diff * vec3(0.27, 0.15, 0.62);
    colorNormalMap.r = sphereNormal.x * 0.5 + 0.5;
    colorNormalMap.g = sphereNormal.y * 0.5 + 0.5;
    colorNormalMap.b = sphereNormal.z * 0.5 + 0.5;

    // fxFloats.x = alphaShadow
    // fxFloats.y = mixNormals
    // fxFloats.z = clickMouseToDraw
    // fxFloats.w = num_lights
    // float doDraw = 1.;
    // if(fxFloats.z > 0.){
    //     doDraw = 0.;
    //     if(iMouse.z > 0.0){
    //         doDraw = 1.;
    //     }
    // }
    // write to normal map
    //iBuffer1 = vec4(texture2D(iChannel2, uv), 1.0);

    float inCircle1 = step(dot(uv - center1.xy, uv - center1.xy), radius1 * radius1);
    float inCircle2 = step(dot(uv - center2.xy, uv - center2.xy), radius2 * radius2);
    float inCircle3 = step(dot(uv - center3.xy, uv - center3.xy), radius3 * radius3);

    float inMainCircle = step(dot(uv - sphereCenter.xy, uv - sphereCenter.xy), radius * radius);

    /*inAnyCircle = max(
        max(inCircle1, inCircle2), 
        inCircle3
    );*/
    float inAnyCircle = step(0.0, inMainCircle);
    float doDraw = 1.0; // step(0.0, fxFloats.z);

    // Calculate colorUV and alpha
    colorUV = mix(colorUV, colorNormalMap, fxFloats.y);
    vec4 color = vec4(colorUV, 1.0);
    color.a = mix(1.0, ((color.r) + (color.g) + (color.b)) / 3.0 * fxFloats.x, step(0.0, fxFloats.x));

    // Calculate final color based on inAnyCircle and doDraw
    vec4 finalColor = mix(decayColor, color, inAnyCircle * doDraw);
    //finalColor.a = mix(1.0, finalColor.a, step(0.0, fxFloats.x));
    finalColor.a = 1.0;

    gl_FragColor = finalColor;
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

        iBuffer0 = vec4(color, 1.0);
    */
}

void main(){
    // gl_FragCoord{x,y}
    // iResolution{x,y}
    // iMouse{x,y,z,w}
    vec2 uv = gl_FragCoord.xy / iResolution.y;
    vec2 mouse = iMouse.xy / iResolution.y;
    uv.x *= iResolution.x / iResolution.y;
    mouse.x *= iResolution.x / iResolution.y;

    // if we're on the left half draw the full "previous" color
    // float baselineShift = fxFloats2.x; // Define the baseline shift value
    // if(baselineShift == 0.0){
        // mono
        main_inner(uv.xy, mouse);
    // }else{
    //     // stereo
    //     if (uv.x < 0.5) {
    //         // left eye
    //         uv.x = (uv.x * 2.0) - baselineShift; // Shift uv.x for left eye
    //         uv.y = uv.y * 2.0; // hold aspect ratio
    //         main_inner(uv.xy);
    //     }else{
    //         // right eye
    //         uv.x = ((uv.x - 0.5) * 2.0) + baselineShift; // Shift uv.x for right eye
    //         uv.y = uv.y * 2.0; // hold aspect ratio
    //         main_inner(uv.xy);
    //     }
    // }
}