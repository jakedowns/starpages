// Frosted Video Mandlebulb
// https://www.shadertoy.com/view/4f2GDh

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
uniform vec4 iMouseRaw;
// define PI
const float PI = 3.1415926535897932384626433832795;
// End shadertoy global uniforms

uniform vec4 iMouseWheel; // special, non-shader-toy uniform
// xy = lerped, uv = raw

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

vec3 mb(vec3 p, float time) {
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
        // Simplified phase shift calculation
        // The phase shift is now directly proportional to the y position of the mouse
        float chill_out = 0.001;
        phi = asin(z.z / r) + ((iMouse.y + 0.5) * time * chill_out);
        // multiply instead for some REAL fun
        //phi = asin(z.z / r) * ((iMouse.y) * time * chill_out);
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

/*
* This block of code defines the function `f`, which takes a 3D vector `p` and a time variable as inputs.
* The function first rotates the vector `p` around the y-axis by `time * 0.2` radians.
* Then, it calls the function `mb` with `p` and `time` as arguments and returns the result.
* The function `mb` is responsible for generating the Mandelbulb fractal.
*/
vec3 f(vec3 p, float time) {
    ry(p, time * 0.2);
    return mb(p, time);
}

/*
    this function is used to calculate the soft shadow
    ro: ray origin
    rd: ray direction
    k:  attenuation factor, typically in the range [0.0, 1.0] where 0 means no shadow and 1 means full shadow
    time: time
*/
float softshadow(vec3 ro, vec3 rd, float k, float time) {
    // Attenuation factor 'k' controls the rate at which the shadow fades with distance.
    // A value of 0.0 means no shadow, while 1.0 means full shadow.
    // Valid range for 'k' is [0.0, 1.0].
    float akuma = 1.0, h = 0.0;
    float t = 0.01;
    for(int i = 0; i < 50; ++i) {
        h = f(ro + rd * t, time).x;
        if(h < 0.001)
            return 0.02;
        akuma = min(akuma, k * h / t);
        t += clamp(h, 0.01, 2.0);
    }
    return akuma;
}

/*
* This function calculates the normal of a 3D position in the Mandelbulb fractal.
* It uses the central difference method to approximate the gradient at the given position.
* The gradient is then normalized to get the normal.
* pos: the 3D position in the fractal
* time: the time variable
*/
vec3 nor(in vec3 pos, float time) {
    // Define a small value for calculating the derivative
    vec3 eps = vec3(0.001, 0.0, 0.0);
    
    // Calculate the gradient using the central difference method
    vec3 gradient = vec3(
        f(pos + eps.xyy, time).x - f(pos - eps.xyy, time).x,
        f(pos + eps.yxy, time).x - f(pos - eps.yxy, time).x,
        f(pos + eps.yyx, time).x - f(pos - eps.yyx, time).x
    );
    
    // Normalize the gradient to get the normal
    return normalize(gradient);
}

/*
* This function calculates the intersection of a ray with the Mandelbulb fractal.
* ro: ray origin
* rd: ray direction
* time: time variable
*/
vec3 intersect(in vec3 ro, in vec3 rd, float time) {
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

    // Iterate to find the intersection
    for(int i = 0; i < 48; i++) {
        // If the error is less than half the pixel size or the ray has traveled too far, stop iterating
        if(error < pixel_size * 0.5 || t > 20.0) {
            break;
        } else {  // avoid broken shader on windows
            // Calculate the distance to the fractal at the current ray position
            c = f(ro + rd * t, time);
            d = c.x;

            // If the distance is increasing, adjust the step size
            if(d > os) {
                os = 0.4 * d * d / pd;
                step = d + os;
                pd = d;
            } else {
                // If the distance is decreasing, reset the step size and overshoot
                step = -os;
                os = 0.0;
                pd = 100.0;
                d = 1.0;
            }

            // Calculate the error
            error = d / t;

            // If the error is less than the maximum error, update the result
            if(error < max_error) {
                max_error = error;
                res_t = t;
                res_c = c;
            }

            // Move the ray forward
            t += step;
        }
    }

    // If the ray has traveled too far or the error is too large, set the result to -1
    if(t > 20.0/* || max_error > pixel_size*/ )
        res_t = -1.0;

    // Return the result
    return vec3(res_t, res_c.y, res_c.z);
}
float map(float v, float a, float b, float c, float d) {
    return (v - a) * (d - c) / (b - a) + c;
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
vec3 transform3DPointToUVDepth(vec3 point, vec3 normal, vec3 camPos, vec3 camToP, vec4 camOrientation, float time) {
     // Convert camera orientation quaternion to rotation matrix
    mat3 camRotation = quaternionToMat3(camOrientation);

    // Convert point to spherical coordinates
    vec3 dir = normalize(point - camPos);
    float u = 0.5 + atan(dir.z, dir.x) / (2.0 * PI);
    float v = 0.5 - asin(dir.y) / PI;

    // Rotate UV coordinates to counteract the camera rotation
    vec2 uv = (camRotation * dir).xy;
    uv = uv * 0.5 + 0.5; // Map from -1..1 to 0..1 range

    float repeatFactorX,repeatFactorY;

    // Define the range for the texture scale
    float texScale_min = 0.0;
    float texScale_max = .2;

    

    

    // determine repeatFactorX,Y as a proportion of the mouses distance from the center of the screen:
    // mouse near center: sets repeatFactor < 1.0
    // midway from center to edge: repeatFactor = 1
    // near edges of screen: repeatFactor = somewhere between 1 and 1000 (gradient)
    
    // Centering the UV coordinates
    vec2 centeredUV = point.xy / iResolution.xy;

    repeatFactorX = map(iMouse.x, -1., 1., texScale_min, texScale_max);
    repeatFactorY = map(iMouse.y, -1., 1., texScale_min, texScale_max);

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

void mainImageSuperSampled(out vec4 fragColor, in vec2 fragCoord) { 

    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    // Mod wrap around if taller than iResolution.y
    // Instead of hard mod wrap, do a reflective wrap that begins scaling inversely back to the inflection point
    // mouse wheel scaler
    float mws = iMouseWheel.y / iResolution.y;
    mws = mws - 4.0 * floor((mws + 1.0) / 4.0);
    mws = abs(mws);
    //mws += .1;

    float debug_element_alpha = .2;
    //float debug_element_prescale = .01;
    
    if (length(fragCoord - iMouse.xy) < 30.0 * mws) {
        fragColor += vec4(0.0, 1.0, 0.0, debug_element_alpha);
        //return;
    }

    // if we're within a 30px radius of iMouseRaw, return full red
    if (length(fragCoord - iMouseRaw.xy) < 20.0 * mws) {
        fragColor += vec4(1.0, 0.0, 0.0, debug_element_alpha);
        //return;
    }

    

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

    // Camera control is achieved by manipulating the time variable and the camera's position and orientation.
    // The time variable is interpolated between iTime and -iTime based on the x position of the mouse.
    // This allows for a dynamic change in the scene based on user input.
    // Remap iMouse.x from [0, 1] to [-10, 10] with 0.5 mapping to 0
    float mouseXScaled = iMouse.x / iResolution.x;
    float remappedMouseX = mouseXScaled; // mix(-100.0, 100.0, mouseXScaled);
    // Add the remapped mouse position to iTime to control the time offset
    float time = iTime * remappedMouseX;
    // Define constants for time modulation
    float baseValue = 0.7 * .9;
    float amplitude = 2. * mws;
    float frequency = 0.4 * .1;
    
    // Apply sinusoidal modulation to stime and ctime
    stime = baseValue + amplitude * sin(time * frequency);
    ctime = baseValue + amplitude * cos(time * frequency);

    // The target (ta) is set to the origin, and the camera position (ro) is calculated based on the sin and cos of time.
    // This creates a circular motion around the target.
    vec3 ta = vec3(0.0, 0.0, 0.0);
    vec3 ro = vec3(0.0, 3. * stime * ctime, 3. * (1. - stime * ctime));

    // The forward (cf), right (cs), and up (cu) vectors are calculated based on the camera position and target.
    // These vectors are used to transform the view coordinates to world coordinates.
    vec3 cf = normalize(ta - ro);
    vec3 cs = normalize(cross(cf, vec3(0.0, 1.0, 0.0)));
    vec3 cu = normalize(cross(cs, cf));
    vec3 rd = normalize(uv.x * cs + uv.y * cu + 3.0 * cf);  // transform from view to world

    // The zoom effect isn't working as expected. 
    // Instead of scaling the current coordinate system, we will adjust the camera's position and direction.
    // This will create a zoom effect by moving the camera closer to or further from the scene.
    // Adjust the multiplication factor to control the zoom level and prevent the camera from getting too close.
    ro += rd * mws * 2.;
    rd = normalize(rd);
    

    // The direction of the sun and its color are defined.
    vec3 sundir = normalize(vec3(0.1, 0.8, 0.6));
    vec3 suncolor = vec3(0.26, 0.34, 0.54);
    vec3 skycolor = vec3(0.55, 0.29, 0.72);

    // The background color is calculated based on the y coordinate of the view.
    vec3 bg = exp(uv.y - 2.0) * vec3(0.4, 1.6, 1.0);
    // hue-shift the bg
    bg = mix(bg, vec3(0.4, 1.6, 1.0), 0.5);

    // The halo effect is calculated based on the dot product of the normalized vectors from the camera to the origin and the ray direction.
    float halo = clamp(dot(normalize(vec3(-ro.x, -ro.y, -ro.z)), rd), 0.0, 1.0);
    vec3 col = bg + vec3(1.0, 0.8, 0.4) * pow(halo, 17.0);

    // Initialize the ray marching distance (t) and the current position (p) along the ray.
    float t = 0.0;
    vec3 p = ro;

    // Calculate the camera's orientation quaternion (inverse of camera rotation)
    // This is used later for transforming 3D points to UV coordinates with depth.
    vec4 camOrientation = calculateCameraOrientationQuaternion(ro, ta, up);

    // result
    vec3 res = intersect(ro, rd, time);
    if(res.x > 0.0) {
        float SHADOW_ATTENUATION = .1; //-2.;
        p = ro + res.x * rd;
        vec3 n = nor(p, time);
        float shadow = softshadow(p, sundir, SHADOW_ATTENUATION, time);

        // Define base colors for the lighting components
        vec3 sunColor = vec3(0.4, 1.0, 1.0);
        vec3 skyColor = vec3(0.29, 0.11, 0.41);
        vec3 backgroundColor = vec3(0.93, 0.06, 0.89);

        // Diffuse lighting component based on the dot product of the normal and the sun direction
        float dif = max(0.0, dot(n, sundir));
        vec3 diffuseColor = sunColor * dif;

        // Sky light component based on the dot product of the normal and the up vector
        float sky = 0.6 + 0.4 * max(0.0, dot(n, vec3(0.0, 1.0, 0.0)));
        vec3 skyLightColor = skyColor * sky;

        // Backlight component based on the dot product of the inverse sun direction and the normal
        float bac = max(0.3 + 0.7 * dot(vec3(-sundir.x, -1.0, -sundir.z), n), 0.0);
        vec3 backlightColor = sunColor * bac;

        // Specular lighting component based on the dot product of the sun direction and the reflection direction
        float spe = max(0.0, pow(clamp(dot(sundir, reflect(rd, n)), 0.0, 1.0), 10.0));
        vec3 specularColor = sunColor * spe;

        // float shadow_increaser = (iMouseRaw.x / iResolution.x) * 1.;
        // // double the shadow's effect on the brightness
        // dif *= shadow_increaser;
        // shadow *= shadow_increaser;

        vec3 lin = 4.5 * diffuseColor * shadow;
        lin += 0.8 * backlightColor;
        lin += 0.6 * skyLightColor * shadow;
        lin += 3.0 * specularColor * shadow;

        // Adjust the y component of the result and create a color gradient based on the adjusted value
        res.y = pow(clamp(res.y, 0.0, 1.0), 0.55);
        // Create a color gradient by applying a sine function to the adjusted y component
        vec3 tc0 = 0.5 + 0.5 * sin(3.0 + 4.2 * res.y + vec3(0.0, 0.5, 1.0));
        // Apply the lighting and the color gradient to the final color
        col = lin * vec3(0.9, 0.8, 0.6) * 0.2 * tc0;
        // Mix the computed color with the background color based on the distance
        col = mix(col, backgroundColor, 1.0 - exp(-0.001 * res.x * res.x));

        float camDist = length(ro - p);
        // vector from camera to point
        vec3 camToP = p - ro;
        vec4 pole = vec4(0.0, 1.0, 0.0, 0.0); 
        // Transform the 3D point to UV coordinates with depth, using the camera's orientation
        vec3 newUV = transform3DPointToUVDepth(p, n, ro, camToP, camOrientation, time);

        // Sample from iChannel0 using the new UV coordinates
        vec4 texColor = texture(iChannel0, newUV.xy);
        col = mix(col, texColor.rgb, n * 0.5 + 0.5);

        // apply fog based on newUV.z
        // make sure newUV.z is in the range 0.0 to 1.0
        //newUV.z = clamp(newUV.z, 0.0, 1.0);
        // float fogAmount = smoothstep(0.5, 1.0, 1e30-newUV.z);
        //col = mix(col, bg, fogAmount * 0.1);

        
        
        
        
        
        // Apply fresnel effect to the mandlebulb
        // The effect is more pronounced when iMouse.y is high
        // 1.0 is the maximum value for the dot product of the normal and the ray direction
        // 3.0 is the power to which the result is raised, controlling the intensity of the fresnel effect
        // ===
        float factor2 = (iMouseRaw.y/iResolution.y);
        float fresnel = pow(1.0 - dot(n, rd), 3. * factor2);
        vec3 fresnelEffect = vec3(1.0, 1.0, 1.0) * fresnel;
        col += 1.0 - fresnelEffect;  // Additively mix the fresnel effect

        
        
        
        
        
        // Apply a flipped normal texel lookup for environment mapping
        // Use the normal from before for the texture lookup
        // Use "newUV" our reprojected vec3 and our normal to flip it to the other "side" of the "env" for texture lookup
        // ===
        vec4 texColor2 = texture(iChannel0, vec2(1.0 - n.x, newUV.y));

        // crank the brightness based on iMouse.y
        // ===
        // float brightness = (iMouse.y);// * 2.0;
        // texColor2.rgb *= brightness;

        // Blend the colors based on the fresnel effect
        // Only show the bright flipped reflections in the fresnel-shaded areas
        // Do not apply to the non fresnel (sharp camera/surface angles) based on a smooth, continuous falloff
        // ===
        // float fresnelBlend = 1.0 - fresnel;
        // float fresnelBlend2 = smoothstep(0.0, 1.0, fresnelBlend);
        // col += mix(vec4(0.), vec4(texColor2.rgb,1.0), fresnelBlend2).rgb;

        // fake the appearance of a diffuse point light
        // ===
        float lightRadius = 0.1;
        float lightIntensity = 0.999;
        float lightDistance = length(p - ro);
        float lightAmount = smoothstep(lightRadius, 0.0, lightDistance);
        // set the color to magenta in a variable
        vec3 magentaColor = vec3(1.0, 0.0, 1.0);
        col = mix(col, magentaColor, lightAmount);

        // blur / diffusion

        //random sample to create a grainy / bokeh effect based on distance to camera
        float randomSample = fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
        float grainAmount = smoothstep(0.0, 1.0, randomSample * 0.9 * camDist);
        grainAmount = mix(grainAmount, 1.0, 0.3);

        // use the grain to tweak the lookup coordinates
        float maxOffset = 0.01;
        vec2 grainOffset = vec2(randomSample * maxOffset, randomSample * maxOffset);
        vec4 texColor3 = texture(iChannel0, newUV.xy + grainOffset);
        col = mix(col, texColor3.rgb, grainAmount);
    } 

    // Mix the luminance into the existing color
    //col = mix(col, vec3(luminance), 0.5); // Adjust the 0.5 as needed for mixing amount

    // use pixel brightness to offset the texture lookup
    //float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    //vec2 offsetLookup = vec2(lum * 10.0, 0.0);
    // vec4 texColor2 = texture(iChannel0, fragCoord/iResolution.xy + offsetLookup);
    // col = mix(col, texColor2.rgb, 0.5);

    // // show a Picture-in-Picture in the top left of the original iChannel0
    // // make sure to make it appear scaled down in the top left corner
    // vec2 PIP_TOP_LEFT_RANGE = vec2(0.0, 0.2);
    // vec2 PIP_SIZE = vec2(0.2, 0.2);
    // vec2 PIP_OFFSET = vec2(0.0, 0.0);
    // vec2 PIP_UV = (fragCoord.xy - iResolution.xy * PIP_TOP_LEFT_RANGE) / (iResolution.xy * PIP_SIZE);
    // float mask = step(0.0, PIP_UV.x) * step(0.0, PIP_UV.y) * step(PIP_UV.x, 1.0) * step(PIP_UV.y, 1.0);
    // col = mix(col, texture(iChannel0, PIP_UV + PIP_OFFSET).rgb, mask * 0.5);

    // post
    col = pow(clamp(col, 0.0, 1.0), vec3(0.45));
    col = col * 0.6 + 0.4 * col * col * (3.0 - 2.0 * col);  // contrast
    col = mix(col, vec3(dot(col, vec3(0.33))), -0.5);  // satuation
    col *= 0.5 + 0.5 * pow(16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.7);  // vigneting
    vec4 nextCol = vec4(col.xyz, smoothstep(0.55, .76, 1. - res.x / 5.));
    fragColor += nextCol;
    // fragColor = mix(nextCol, fragColor, luminance);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Define the number of samples per pixel
    const int numSamples = 1;//4;

    // Initialize color accumulator
    vec4 accumColor = vec4(0.0);

    // Loop over each sample
    for (int i = 0; i < numSamples; ++i) {
        // Generate a random offset within the pixel
        vec2 offset = vec2(float(i) / float(numSamples)) - 0.5;

        // Add the offset to the fragment coordinates
        vec2 sampleCoord = fragCoord + offset;

        // Calculate the color for this sample
        vec4 sampleColor;
        mainImageSuperSampled(sampleColor, sampleCoord);

        // Accumulate the color
        accumColor += sampleColor;
    }

    // Average the accumulated color
    fragColor = accumColor / float(numSamples);
}

// Comment this out on shadertoy
void main() {
    vec4 fragColor = vec4(0.0);
    vec2 fragCoord = gl_FragCoord.xy;
    mainImage(fragColor, fragCoord);
    gl_FragColor = fragColor;
}
// End Comment block
