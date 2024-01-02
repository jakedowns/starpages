// Created by evilryu
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// via https://www.shadertoy.com/view/MdXSWn

// compatibility uniforms
// iTime: { value: 1.0 },
// iChannel0: { value: texture },
// iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1.0) },
uniform float iTime;
uniform sampler2D iChannel0;
uniform vec3 iResolution;
uniform vec4 iMouse;

// whether turn on the animation
//#define phase_shift_on 

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
        phi = asin(z.z / r) + iTime * 0.1;
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
vec3 transform3DPointToUVDepth(vec3 point, vec3 normal, vec3 camPos, vec3 camToP) {
    // slide the point to the center of the screen
    point.xy -= iResolution.xy * 0.5;

    // Basic UV transformation
    vec2 uv = fract(vec2(point.x, point.y) * 0.1);

    // Apply distortion based on normal direction
    uv += normal.xy * 0.005; // Adjust the factor as needed

    // Apply a non-linear transformation based on camera distance
    float camDist = length(camPos - point); // Calculate the distance from the camera to the point
    float distFactor = smoothstep(0.0, 20.0, camDist); // Adjust range as needed
    uv += vec2(sin(uv.y * 3.14 * distFactor), cos(uv.x * 3.14 * distFactor)) * 0.02;

    // Add depth information as the third component
    float depth = length(camToP); // Calculate depth based on the vector from camera to point

    return vec3(uv, depth);
}


void mainImage(out vec4 fragColor, in vec2 fragCoord) { 
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
    vec3 skycolor = vec3(0.6, 1.5, 1.0);

    vec3 bg = exp(uv.y - 2.0) * vec3(0.4, 1.6, 1.0);

    float halo = clamp(dot(normalize(vec3(-ro.x, -ro.y, -ro.z)), rd), 0.0, 1.0);
    vec3 col = bg + vec3(1.0, 0.8, 0.4) * pow(halo, 17.0);

    float t = 0.0;
    vec3 p = ro;

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
        vec3 newUV = transform3DPointToUVDepth(p, n, ro, camToP);

        // Sample from iChannel0 using the new UV coordinates
        vec4 texColor = texture(iChannel0, newUV.xy);
        col = texColor.rgb;

        // apply fog based on newUV.z
        // float fogAmount = smoothstep(0.0, 1.0, newUV.z);
        // col = mix(col, bg, fogAmount);
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

void main() {
    vec4 fragColor = vec4(0.0);
    vec2 fragCoord = gl_FragCoord.xy;
    mainImage(fragColor, fragCoord);
    gl_FragColor = fragColor;
}