precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uBaseTexture;
uniform sampler2D uOriginalPixelDataTexture;
uniform sampler2D uOffsetTexture;
uniform sampler2D uSelectedImageTexture;
uniform float uSwirlTurns;
uniform float uSwirlAmp;
vec2 center = vec2(0.5, 0.5); // Center of the swirl, usually the middle of the texture
uniform int uMode;
uniform int uPxDensity;

uniform float uReflectionX;
uniform float uReflectionY;

uniform float uScrollOffsetYSpeed;
uniform float uScrollOffsetXSpeed;

float PI = 3.1415926535897932384626433832795;

uniform int uSortOffset;
uniform int uSortStepSize;

vec2 corrected;

vec2 applySwirl(vec2 uv, float uSwirlTurns, float uSwirlAmp, vec2 center) {
    // Translate UV coordinates so that the center of the swirl is at (0,0)
    vec2 offset = uv - center;

    // Calculate the distance from the center
    float distance = length(offset);

    // Calculate the angle for the swirl
    float angle = uSwirlTurns * 2.0 * PI * distance;
    float scale = 1.5;

    // Adjust the angle based on the swirl amplitude
    if (uSwirlAmp < 0.5) {
        // Decay the spiral
        angle *= mix(1.0, 0.0, (0.5 - uSwirlAmp) * scale);
    } else {
        // Accelerate the spiral's divergence
        angle *= mix(1.0, 2.0, (uSwirlAmp - 0.5) * scale);
    }

    // remap the range from 0.0 - 1.0 to 0.0 - 0.5
    angle *= 0.5;

    // Rotate the coordinates
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = center + rotation * offset;

    return uv;
}

void main() {
    // gl_FragColor = vec4(0.0,1.0,0.0,1.0);
    // return;

    // adjust for pixel density
    corrected = gl_FragCoord.xy / (uResolution * float(uPxDensity));
    // adjust for aspect ratio to square pixels
    //corrected.x *= uResolution.x / uResolution.y;

    // adjust center for aspect ratio to square pixels
    //center.x *= uResolution.x / uResolution.y;

    // apply swirl
    corrected = applySwirl(corrected, uSwirlTurns, uSwirlAmp, center);

    // scroll offset based on uScrollOffsetYSpeed
    corrected.y += uTime * uScrollOffsetYSpeed; // * 0.01;
    // wrap around
    corrected.y = mod(corrected.y, 1.0);

    // and X
    corrected.x += uTime * uScrollOffsetXSpeed; // * 0.01;
    // wrap around
    corrected.x = mod(corrected.x, 1.0);

    // if uSortOffset > 0, we need to check if _this_ pixel's corresponding index
    // falls within uSortStepSize worth of pixels as expressed in a 1D array of rgba values
    // if so, we need to return yellow
    // int numPixels = int(uResolution.x * uResolution.y);
    int correctedNumPixels = int(uResolution.x * uResolution.y) / uPxDensity;
    int correctedSortOffset = uSortOffset; // / uPxDensity;
    int correctedSortStepSize = uSortStepSize; // / uPxDensity;
    if(correctedSortOffset > 0){
        // we need to check if this pixel's corresponding index falls within the sort window
        // if so, we need to return yellow
        int correctedPixelIndex = int(corrected.y * uResolution.x + corrected.x);
        if(correctedPixelIndex >= correctedSortOffset && correctedPixelIndex < correctedSortOffset + correctedSortStepSize){
            gl_FragColor = vec4(1.0,1.0,0.0,1.0);
            return;
        }
    }
    
    if(uMode == 1){
        // default mode: use the offset texture's [r]ed channel to offset our uv/xy[x] lookup in the OPPPOSITE direction
        // and use offset texture's [g]reen channel to offset our uv/xy[y] lookup in the OPPPOSITE direction
        
        vec4 offsetData = texture2D(uOffsetTexture, corrected);
        vec2 offsetCoords = corrected;
        offsetCoords.x += offsetData.r;
        offsetCoords.y += offsetData.g;
        // Apply the swirl
        //offsetCoords = applySwirl(offsetCoords, uSwirlTurns, uSwirlAmp, center);

        gl_FragColor = texture2D(uOriginalPixelDataTexture, offsetCoords);
        // constrain r,g,b to 0.0 - 1.0
        gl_FragColor.r = clamp(gl_FragColor.r, 0.0, 1.0);
        gl_FragColor.g = clamp(gl_FragColor.g, 0.0, 1.0);
        gl_FragColor.b = clamp(gl_FragColor.b, 0.0, 1.0);
        
    }else if(uMode == 2){
        // ramp between "magma" dark black, purple, yellow, and white
        // based on the magnitude of sample r and g channels: texture2D(uOffsetTexture, corrected)
        vec4 black = vec4(0.0,0.0,0.0,1.0);
        vec4 purple = vec4(0.5,0.0,0.5,1.0);
        vec4 magenta = vec4(1.0,0.0,1.0,1.0);
        vec4 yellow = vec4(1.0,1.0,0.0,1.0);
        vec4 white = vec4(1.0,1.0,1.0,1.0);

        // 1. sample offset texture's r and g channels
        vec4 my_sample = texture2D(uOffsetTexture, corrected);

        // 2. calculate magnitude of r and g channels
        float magnitude = sqrt(my_sample.r * my_sample.r + my_sample.g * my_sample.g);

        // 3. lerp from base texture towards "target" offset texture
        // Corrected the nested mix functions
        vec4 gradientSample = mix(black, 
                                mix(purple, 
                                    mix(magenta, 
                                        mix(yellow, white, magnitude), 
                                    magnitude),
                                magnitude),
                            magnitude);

        // 4. set the fragment color
        gl_FragColor = gradientSample;
    }else if(uMode == 3){
        gl_FragColor = texture2D(uBaseTexture, corrected);    
    }else if(uMode == 4){
        // debug sample uSelectedImageTexture
        gl_FragColor = texture2D(uSelectedImageTexture, corrected);
    }else{
        // fallback mode
        // debug sample unmodified base texture
        gl_FragColor = texture2D(uOriginalPixelDataTexture, corrected);    
    }
    // make sure our alpha channel is 1.0
    gl_FragColor.a = 1.0; //clamp(gl_FragColor.a, 0.1, 1.0);
}