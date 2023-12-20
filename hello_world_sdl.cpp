// Copyright 2011 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

#include <stdio.h>
#include <SDL/SDL.h>
#include <cmath>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

int centerX = 128; // Center of the screen
int centerY = 128;
double time = 0.0; // Time variable to control rotation
SDL_Surface *screen;

// Function to convert HSV to RGB
void HSVtoRGB(int &r, int &g, int &b, double h, double s, double v) {
    int i;
    double f, p, q, t;
    if (s == 0) {
        r = g = b = v;
        return;
    }
    h /= 60; // sector 0 to 5
    i = floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch (i) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        default: // case 5:
            r = v, g = p, b = q;
            break;
    }
}
void draw() {
    if (SDL_MUSTLOCK(screen)) SDL_LockSurface(screen);
    for (int i = 0; i < 256; i++) {
        for (int j = 0; j < 256; j++) {
            int dx = i - centerX;
            int dy = j - centerY;
            double distance = sqrt(dx*dx + dy*dy);
            double angle = atan2(dy, dx) + time; // Add time to the angle

            // Convert angle (range -pi to pi) to hue (range 0 to 1)
            double hue = (angle + M_PI) / (2 * M_PI);
            int r, g, b;
            HSVtoRGB(r, g, b, hue * 360, 1, 1); // Convert HSV to RGB

            //*((Uint32*)screen->pixels + i * 256 + j) = SDL_MapRGBA(screen->format, r, g, b, 255);
            // Print UV coordinate colors
            r = 128 + 127 * sin(time + i * 0.01);
            g = 128 + 127 * sin(time + i * 0.01 + 2 * M_PI / 3); // Phase shift by 1/3 cycle
            b = 128 + 127 * sin(time + i * 0.01 + 4 * M_PI / 3); // Phase shift by 2/3 cycle
            *((Uint32*)screen->pixels + i * 256 + j) = SDL_MapRGBA(screen->format, r, g, b, 255);
        }
    }
    if (SDL_MUSTLOCK(screen)) SDL_UnlockSurface(screen);
    SDL_Flip(screen);

    time += 0.01; // Increment time
}

int main(int argc, char** argv) {
    SDL_Init(SDL_INIT_VIDEO);
    screen = SDL_SetVideoMode(256, 256, 32, SDL_SWSURFACE);
    if (screen == NULL) {
        printf("Could not set video mode: %s\n", SDL_GetError());
        return 1;
    }

    puts("Hello World!");
    
    emscripten_set_main_loop(draw, 0, 1); // Set the draw function to be called each frame

    SDL_Quit();

    return 0;
}