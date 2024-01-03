// Fork of "mandlebulb_" by evilryu: // via https://www.shadertoy.com/view/MdXSWn
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

// modified by jakedowns on 1/1/24 to add iChannel0 texture support
// https://jakedowns.github.io/starpages/webgl2.html

// whether turn on the animation
#define phase_shift_on 

// Comment these out to past into shadertoy
uniform float iTime;
uniform sampler2D iChannel0;
uniform vec3 iResolution;
uniform vec4 iMouse;
// define PI
const float PI = 3.1415926535897932384626433832795;
// End shadertoy global uniforms

float stime, ctime;
void ry(inout vec3 p, float a) {
    float c, s;
    vec3 q = p;
    c = cos(a);
    s = sin(a);
    p.x = c * q.x + s * q.z;
    p.z = -s * q.x + c * q.z;
}

float pixel_size = 0.0;

/* 

z = r*(sin(theta)cos(phi) + i cos(theta) + j sin(theta)sin(phi)

zn+1 = zn^8 +c

z^8 = r^8 * (sin(8*theta)*cos(8*phi) + i cos(8*theta) + j sin(8*theta)*sin(8*theta)

zn+1' = 8 * zn^7 * zn' + 1

*/

vec3 mb(vec3 p) {
    p.xyz = p.xzy;
    vec3 z = p;
    vec3 dz = vec3(0.0);
    float power = 8.0;
    float r, theta, phi;
    float dr = 1.0;

    float t0 = 1.0;
    for(int i = 0; i < 7; ++i) {
        r = length(z);
        if(r > 2.0)
            continue;
        theta = atan(z.y / z.x);
        #ifdef phase_shift_on
        // Determine the mouse position and adjust the phase shift accordingly
        float mouseX = iMouse.x;
        // Create a smooth gradient using sin function
        // Scale the sin wave such that 1 period matches screen width in our current coordinate context
        float gradient = sin(mouseX / 2.0);
        // Adjust the phase shift based on the gradient
        phi = asin(z.z / r) + gradient * iTime * 0.1;
        #else
        phi = asin(z.z / r);
        #endif

        dr = pow(r, power - 1.0) * dr * power + 1.0;

        r = pow(r, power);
        theta = theta * power;
        phi = phi * power;

        z = r * vec3(cos(theta) * cos(phi), sin(theta) * cos(phi), sin(phi)) + p;

        t0 = min(t0, r);
    }
    return vec3(0.5 * log(r) * r / dr, t0, 0.0);
}

vec3 f(vec3 p) {
    ry(p, iTime * 0.2);
    return mb(p);
}

float softshadow(vec3 ro, vec3 rd, float k) {
    float akuma = 1.0, h = 0.0;
    float t = 0.01;
    for(int i = 0; i < 50; ++i) {
        h = f(ro + rd * t).x;
        if(h < 0.001)
            return 0.02;
        akuma = min(akuma, k * h / t);
        t += clamp(h, 0.01, 2.0);
    }
    return akuma;
}

vec3 nor(in vec3 pos) {
    vec3 eps = vec3(0.001, 0.0, 0.0);
    return normalize(vec3(f(pos + eps.xyy).x - f(pos - eps.xyy).x, f(pos + eps.yxy).x - f(pos - eps.yxy).x, f(pos + eps.yyx).x - f(pos - eps.yyx).x));
}

vec3 intersect(in vec3 ro, in vec3 rd) {
    float t = 1.0;
    float res_t = 0.0;
    float res_d = 1000.0;
    vec3 c, res_c;
    float max_error = 1000.0;
    float d = 1.0;
    float pd = 100.0;
    float os = 0.0;
    float step = 0.0;
    float error = 1000.0;

    for(int i = 0; i < 48; i++) {
        if(error < pixel_size * 0.5 || t > 20.0) {
        } else {  // avoid broken shader on windows

            c = f(ro + rd * t);
            d = c.x;

            if(d > os) {
                os = 0.4 * d * d / pd;
                step = d + os;
                pd = d;
            } else {
                step = -os;
                os = 0.0;
                pd = 100.0;
                d = 1.0;
            }

            error = d / t;

            if(error < max_error) {
                max_error = error;
                res_t = t;
                res_c = c;
            }

            t += step;
        }

    }
    if(t > 20.0/* || max_error > pixel_size*/ )
        res_t = -1.0;
    return vec3(res_t, res_c.y, res_c.z);
}
float remapMousePosition(float mousePos, float in_min, float in_max, float out_min, float out_max) {
    return (mousePos - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
mat3 quaternionToMat3(vec4 q) {
    float qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    float qx2 = qx + qx, qy2 = qy + qy, qz2 = qz + qz;
    float qxqx2 = qx * qx2, qxqy2 = qx * qy2, qxqz2 = qx * qz2;
    float qxqw2 = qw * qx2, qyqy2 = qy * qy2, qyqz2 = qy * qz2;
    float qyqw2 = qw * qy2, qzqz2 = qz * qz2, qzqw2 = qw * qz2;
    return mat3(
        1.0 - (qyqy2 + qzqz2), qxqy2 - qzqw2, qxqz2 + qyqw2,
        qxqy2 + qzqw2, 1.0 - (qxqx2 + qzqz2), qyqz2 - qxqw2,
        qxqz2 - qyqw2, qyqz2 + qxqw2, 1.0 - (qxqx2 + qyqy2)
    );
}
vec4 calculateCameraOrientationQuaternion(vec3 ro, vec3 ta, vec3 up) {
    vec3 forward = normalize(ta - ro);
    vec3 right = normalize(cross(forward, up));
    vec3 newUp = cross(right, forward);

    float t = forward.x + newUp.y - forward.z;
    float w, x, y, z;
    if (t > 0.0) {
        t = sqrt(t + 1.0);
        w = 0.5 * t;
        t = 0.5 / t;
        x = (newUp.z - right.y) * t;
        y = (right.x - forward.y) * t;
        z = (forward.z - newUp.x) * t;
    } else if (forward.x > newUp.y && forward.x > -forward.z) {
        t = sqrt(1.0 + forward.x - newUp.y - forward.z);
        x = 0.5 * t;
        t = 0.5 / t;
        w = (newUp.z - right.y) * t;
        y = (forward.y + right.x) * t;
        z = (forward.z + newUp.x) * t;
    } else if (newUp.y > -forward.z) {
        t = sqrt(1.0 - forward.x + newUp.y - forward.z);
        y = 0.5 * t;
        t = 0.5 / t;
        w = (right.x - forward.y) * t;
        x = (forward.y + right.x) * t;
        z = (newUp.z + right.y) * t;
    } else {
        t = sqrt(1.0 - forward.x - newUp.y + forward.z);
        z = 0.5 * t;
        t = 0.5 / t;
        w = (forward.z - newUp.x) * t;
        x = (forward.z + newUp.x) * t;
        y = (newUp.z + right.y) * t;
    }
    return vec4(x, y, z, w);
}
vec3 transform3DPointToUVDepth(vec3 point, vec3 normal, vec3 camPos, vec3 camToP, vec4 camOrientation) {
     // Convert camera orientation quaternion to rotation matrix
    mat3 camRotation = quaternionToMat3(camOrientation);

    // Convert point to spherical coordinates
    vec3 dir = normalize(point - camPos);
    float u = 0.5 + atan(dir.z, dir.x) / (2.0 * PI);
    float v = 0.5 - asin(dir.y) / PI;

    // Rotate UV coordinates to counteract the camera rotation
    vec2 uv = (camRotation * dir).xy;
    uv = uv * 0.5 + 0.5; // Map from -1..1 to 0..1 range

    // Determine the repeat factor based on mouse position
    float repeatFactorX = 2.;
    float repeatFactorY = 2.;

    float texScaleX_min = 0.0;
    float texScaleX_stop_49 = 0.1;
    float texScaleX_stop_50 = 0.11;
    float texScaleX_stop_100 = 1e3;

    float texScaleY_min = 0.0;
    float texScaleY_stop_49 = 0.1;
    float texScaleY_stop_50 = 0.11;
    float texScaleY_stop_100 = 1e3;

    // repeatFactorX = 
    //     iMouse.x > 0.5
    //     ? remapMousePosition(iMouse.x, 0.5, 1.0, texScaleX_min, texScaleX_stop_49)
    //     : remapMousePosition(iMouse.x, 0.0, 0.5, texScaleX_stop_50, texScaleX_stop_100);

    // repeatFactorY = 
    //     iMouse.y > 0.5
    //     ? remapMousePosition(iMouse.y, 0.5, 1.0, texScaleY_min, texScaleY_stop_49) 
    //     : remapMousePosition(iMouse.y, 0.0, 0.5, texScaleY_stop_50, texScaleY_stop_100);

    

    // Centering the UV coordinates
    vec2 centeredUV = point.xy / iResolution.xy - 0.5;

    // centeredUV.y += iMouse.x < 0.5 ? iMouse.x : 0.0;
    // centeredUV.x += iMouse.y < 0.5 ? iMouse.y : 0.0;

    // Apply the repeating effect to the UV coordinates
    centeredUV *= vec2(repeatFactorX, repeatFactorY);

    // Use mod to create a repeating pattern and recenter it
    //centeredUV = mod(centeredUV, 1.0);

    // Recenter the UV coordinates after repeating
    point.xy = (centeredUV + 0.5) * iResolution.xy;

    // Basic UV transformation
    uv = fract(vec2(point.x, point.y) * 0.1);

    // Apply distortion based on normal direction
    uv += normal.xy * 0.1; // Adjust the factor as needed

    // Apply a non-linear transformation based on camera distance
    float camDist = length(camPos - point); // Calculate the distance from the camera to the point
    // this is how "deep" into the "ice" the image appears
    float max_factor = iMouse.x * .1; //2.; //20.0;
    float distFactor = smoothstep(0.0, max_factor, camDist); // Adjust range as needed
    uv += vec2(sin(uv.y * 3.14 * distFactor), cos(uv.x * 3.14 * distFactor)) * 0.02;

    // Add depth information as the third component
    //float depth = length(camToP); // Calculate depth based on the vector from camera to point

    return vec3(uv, camDist);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) { 
    // Define the up vector
    vec3 up = vec3(0.0, 1.0, 0.0);
     // Sample from iChannel0
    vec4 texColor = texture(iChannel0, fragCoord / iResolution.xy);

    // Calculate luminance
    float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

    vec2 q = fragCoord.xy / iResolution.xy;
    vec2 uv = -1.0 + 2.0 * q;
    uv.x *= iResolution.x / iResolution.y;

    pixel_size = 1.0 / (iResolution.x * 3.0);
	// camera, stime = sin(time), ctime = cos(time)
    stime = 0.7 + 0.3 * sin(iTime * 0.4);
    ctime = 0.7 + 0.3 * cos(iTime * 0.4); 

    // ta = target, ro = camera position
    vec3 ta = vec3(0.0, 0.0, 0.0);
    vec3 ro = vec3(0.0, 3. * stime * ctime, 3. * (1. - stime * ctime));

    // cf = forward, cs = right, cu = up, rd = ray direction
    vec3 cf = normalize(ta - ro);
    vec3 cs = normalize(cross(cf, vec3(0.0, 1.0, 0.0)));
    vec3 cu = normalize(cross(cs, cf));
    vec3 rd = normalize(uv.x * cs + uv.y * cu + 3.0 * cf);  // transform from view to world

    vec3 sundir = normalize(vec3(0.1, 0.8, 0.6));
    vec3 sun = vec3(1.64, 1.27, 0.99);
    vec3 skycolor = vec3(0.29, 0.11, 0.41);

    vec3 bg = exp(uv.y - 2.0) * vec3(0.4, 1.6, 1.0);

    float halo = clamp(dot(normalize(vec3(-ro.x, -ro.y, -ro.z)), rd), 0.0, 1.0);
    vec3 col = bg + vec3(1.0, 0.8, 0.4) * pow(halo, 17.0);

    float t = 0.0;
    vec3 p = ro;

    // Calculate the camera's orientation quaternion (inverse of camera rotation)
    vec4 camOrientation = calculateCameraOrientationQuaternion(ro, ta, up);

    vec3 res = intersect(ro, rd);
    if(res.x > 0.0) {
        p = ro + res.x * rd;
        vec3 n = nor(p);
        float shadow = softshadow(p, sundir, 10.0);

        float dif = max(0.0, dot(n, sundir));
        float sky = 0.6 + 0.4 * max(0.0, dot(n, vec3(0.0, 1.0, 0.0)));
        float bac = max(0.3 + 0.7 * dot(vec3(-sundir.x, -1.0, -sundir.z), n), 0.0);
        float spe = max(0.0, pow(clamp(dot(sundir, reflect(rd, n)), 0.0, 1.0), 10.0));

        vec3 lin = 4.5 * sun * dif * shadow;
        lin += 0.8 * bac * sun;
        lin += 0.6 * sky * skycolor * shadow;
        lin += 3.0 * spe * shadow;

        res.y = pow(clamp(res.y, 0.0, 1.0), 0.55);
        vec3 tc0 = 0.5 + 0.5 * sin(3.0 + 4.2 * res.y + vec3(0.0, 0.5, 1.0));
        col = lin * vec3(0.9, 0.8, 0.6) * 0.2 * tc0;
        col = mix(col, bg, 1.0 - exp(-0.001 * res.x * res.x));

        float camDist = length(ro - p);
        // vector from camera to point
        vec3 camToP = p - ro;
        vec4 pole = vec4(0.0, 1.0, 0.0, 0.0); 
        // Transform the 3D point to UV coordinates with depth, using the camera's orientation
        vec3 newUV = transform3DPointToUVDepth(p, n, ro, camToP, camOrientation);

        // Sample from iChannel0 using the new UV coordinates
        vec4 texColor = texture(iChannel0, newUV.xy);
        col = texColor.rgb;

        // apply fog based on newUV.z
        // make sure newUV.z is in the range 0.0 to 1.0
        //newUV.z = clamp(newUV.z, 0.0, 1.0);
        float fogAmount = smoothstep(0.5, 1.0, 1e30-newUV.z);
        // col = mix(col, bg, fogAmount * 0.1);

        // Apply fresnel effect to the mandlebulb
        // The effect is more pronounced when iMouse.y is high
        // 1.0 is the maximum value for the dot product of the normal and the ray direction
        // 3.0 is the power to which the result is raised, controlling the intensity of the fresnel effect
        float factor2 = iMouse.y * 30.0;
        float fresnel = pow(1.0 - dot(n, rd), 3. * factor2);
        //vec3 fresnelEffect = vec3(1.0, 1.0, 1.0) * fresnel;
        //col += 1.0 - fresnelEffect ;  // Additively mix the fresnel effect

        // Apply a flipped normal texel lookup for environment mapping
        // Use the normal from before for the texture lookup
        // Use "newUV" our reprojected vec3 and our normal to flip it to the other "side" of the "env" for texture lookup
        vec4 texColor2 = texture(iChannel0, vec2(1.0 - n.x, newUV.y));

        // crank the brightness based on iMouse.y
        float brightness = (iMouse.y);// * 2.0;
        texColor2.rgb *= brightness;

        // Blend the colors based on the fresnel effect
        // Only show the bright flipped reflections in the fresnel-shaded areas
        // Do not apply to the non fresnel (sharp camera/surface angles) based on a smooth, continuous falloff
        float fresnelBlend = 1.0 - fresnel; //smoothstep(0.0, 1.0, 1.0 - fresnel);
        col += mix(vec4(0.), vec4(texColor2.rgb,1.0), fresnelBlend).rgb;

        // fake the appearance of a diffuse point light
        // float lightRadius = 0.1;
        // float lightIntensity = 0.999;
        // float lightDistance = length(p - ro);
        // float lightAmount = smoothstep(lightRadius, 0.0, lightDistance);
        // col = mix(col, vec3(lightIntensity), lightAmount);

        // blur / diffusion

        //random sample to create a grainy / bokeh effect based on distance to camera
        // float randomSample = fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
        // float grainAmount = smoothstep(0.0, 1.0, randomSample * 0.9 * camDist);
        // grainAmount = mix(grainAmount, 1.0, 0.5);

        // // // use the grain to tweak the lookup coordinates
        // float maxOffset = 0.01;
        // vec2 grainOffset = vec2(randomSample * maxOffset, randomSample * maxOffset);
        // vec4 texColor3 = texture(iChannel0, newUV.xy + grainOffset);
        // col += mix(col, texColor3.rgb, grainAmount);
    } 

    // Mix the luminance into the existing color
    //col = mix(col, vec3(luminance), 0.5); // Adjust the 0.5 as needed for mixing amount

    // use pixel brightness to offset the texture lookup
    //float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    //vec2 offsetLookup = vec2(lum * 10.0, 0.0);
    // vec4 texColor2 = texture(iChannel0, fragCoord/iResolution.xy + offsetLookup);
    // col = mix(col, texColor2.rgb, 0.5);

    // show a Picture-in-Picture in the top left of the original iChannel0
    // make sure to make it appear scaled down in the top left corner
    vec2 PIP_TOP_LEFT_RANGE = vec2(0.0, 0.2);
    vec2 PIP_SIZE = vec2(0.2, 0.2);
    vec2 PIP_OFFSET = vec2(0.0, 0.0);
    vec2 PIP_UV = (fragCoord.xy - iResolution.xy * PIP_TOP_LEFT_RANGE) / (iResolution.xy * PIP_SIZE);
    float mask = step(0.0, PIP_UV.x) * step(0.0, PIP_UV.y) * step(PIP_UV.x, 1.0) * step(PIP_UV.y, 1.0);
    col = mix(col, texture(iChannel0, PIP_UV + PIP_OFFSET).rgb, mask * 0.5);

    // post
    col = pow(clamp(col, 0.0, 1.0), vec3(0.45));
    col = col * 0.6 + 0.4 * col * col * (3.0 - 2.0 * col);  // contrast
    col = mix(col, vec3(dot(col, vec3(0.33))), -0.5);  // satuation
    col *= 0.5 + 0.5 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.7);  // vigneting
    fragColor = vec4(col.xyz, smoothstep(0.55, .76, 1. - res.x / 5.));
}

// Comment this out on shadertoy
void main() {
    vec4 fragColor = vec4(0.0);
    vec2 fragCoord = gl_FragCoord.xy;
    mainImage(fragColor, fragCoord);
    gl_FragColor = fragColor;
}
// End Comment block
