uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D u_texture;

float R = 0.5;
float r = 0.1;
float scale = 12.0;

// Torus signed distance function
// account for scale
float map(vec3 p) {
    vec2 t = vec2(R, r) * scale; // Torus dimensions: (R, r)
    vec2 r = vec2(length(p.xy) - t.x, p.z);
    return length(r) - t.y;
}

vec3 rotate(vec3 v, float angle, vec3 axis) {
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    mat3 rotationMatrix = mat3(
        oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s, oc * axis.x * axis.z + axis.y * s,
        oc * axis.y * axis.x + axis.z * s, oc * axis.y * axis.y + c,         oc * axis.y * axis.z - axis.x * s,
        oc * axis.z * axis.x - axis.y * s, oc * axis.z * axis.y + axis.x * s, oc * axis.z * axis.z + c
    );

    return rotationMatrix * v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    // raymarching...
    vec3 ro = vec3(0.0, 0.0, 5.0); // ray origin
    vec3 rd = normalize(vec3(uv - 0.5, 1.0)); // ray direction

    float depth = 0.0;
    float maxDepth = 10.0; // maximum depth to march
    for (int i = 0; i < 100; i++) {
        vec3 p = ro + rd * depth;
        float d = map(p);
        if (d < 2.5) {
            break; // Exit the loop if we're inside the torus
        }
        depth += d;
        if (depth > maxDepth) {
            break; // Exit if the ray has marched too far
        }
    }

    // Calculate the direction from the torus center to the fragment position
    vec3 viewDirection = normalize(ro + rd * depth);

    // make a generic function that can rotate the view Direction by an arbitrary angle along an arbitrary axis
    // Apply rotation to the view direction
    // Sweeping to debug all possible rotations
    viewDirection = rotate(viewDirection, u_time, vec3(1.0, 0.0, 0.0));

    // Apply fisheye distortion to the direction
    // This is a simplified example; you'll need a more complex formula
    // for near-360-degree FOV.
    float r = length(viewDirection.xy);
    
    float theta = atan(viewDirection.y, viewDirection.x);
    vec2 distortedUV = vec2(0.5 + r * cos(theta), 0.5 + r * sin(theta));

    // make sure the distorted UV coordinates are within the texture bounds
    distortedUV = clamp(distortedUV, 0.0, 1.0);

    // Sample the texture with the distorted UV coordinates
    gl_FragColor = texture2D(u_texture, distortedUV);

    // Gridline calculations
    float gridSize = 0.1; // Adjust the size of the grid
    vec2 grid = mod(uv, gridSize); // Get the modulated UVs for grid
    bool isLine = grid.x < 0.01 || grid.y < 0.01; // Check if near a gridline

    vec4 gridColor = vec4(1.0, 0.0, 0.0, 1.0); // Red gridlines
    vec4 finalColor = mix(gl_FragColor, gridColor, isLine ? 1.0 : 0.0); // Mix gridlines with your color

    gl_FragColor = finalColor;

    
    return;
}

//     // Create a sphere in 2D
//     float radius = 0.5;
//     // offset uv to center of "quad"
//     uv -= 0.5;

//     float z = sqrt(1.0 - dot(uv, uv));
//     if (dot(uv, uv) > radius * radius) {
//         discard; // Discard fragment outside of sphere radius
//     }                      
    
//     float factor_a = u_mouse.y + 1. / 2.;
//     float factor_b = 1.0-u_mouse.x;

//     float time_scale = 0.1;

//     // Sphere mapping
//     float longitude = atan(
//         sin(uv.y + u_time * time_scale * factor_a), 
//         cos(uv.x + u_time * time_scale * factor_b)
//     );
//     float latitude = acos(z); //mod(z + u_time * time_scale, 1.0) - 0.5);

//     // Rotate the sphere
//     //longitude += u_time * 0.1; // Adjust rotation speed as needed

//     // Convert spherical coordinates to UV map
//     vec2 sphereUV;
//     sphereUV.x = longitude / (2.0 * 3.1415926535897932384626433832795);
//     sphereUV.y = latitude / 3.1415926535897932384626433832795;
    
//     // Sample the texture
//     vec4 textureColor = texture2D(u_texture, sphereUV);
//     gl_FragColor = textureColor;

//     // float factor_a = u_mouse.x;
//     // factor_a*=20.0;

//     // float factor_b = u_mouse.y;
//     // factor_b*=20.0;

//     // float factor_c = u_mouse.x * 0.5;
//     // float factor_d = u_mouse.y * 0.5;

//     // float force = sin(uv.y * factor_a + u_time) * 0.1;
    
//     // uv.y += sin(uv.x * factor_b + u_time) * force;
//     // uv.y += u_time * factor_c;
//     // //uv.y = mod(uv.y, 1.0);

//     // uv.x += u_time * factor_d;
//     // //uv.x = mod(uv.x, 1.0);

//     // gl_FragColor = texture2D(u_texture, uv);
//     // //gl_FragColor.a = 0.1;
// }