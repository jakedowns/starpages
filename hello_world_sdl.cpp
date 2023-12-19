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

int main(int argc, char** argv) {
  printf("hello, world!\n");

  SDL_Init(SDL_INIT_VIDEO);
  SDL_Surface *screen = SDL_SetVideoMode(256, 256, 32, SDL_SWSURFACE);

#ifdef TEST_SDL_LOCK_OPTS
  EM_ASM("SDL.defaults.copyOnLock = false; SDL.defaults.discardOnLock = true; SDL.defaults.opaqueFrontBuffer = false;");
#endif

  if (SDL_MUSTLOCK(screen)) SDL_LockSurface(screen);
  for (int i = 0; i < 256; i++) {
    for (int j = 0; j < 256; j++) {
#ifdef TEST_SDL_LOCK_OPTS
      // Alpha behaves like in the browser, so write proper opaque pixels.
      int alpha = 255;
#else
      // To emulate native behavior with blitting to screen, alpha component is ignored. Test that it is so by outputting
      // data (and testing that it does get discarded)
      int alpha = (i+j) % 255;
#endif
      // Calculate the angle and distance from the center
      int dx = i - centerX;
      int dy = j - centerY;
      double distance = sqrt(dx*dx + dy*dy);
      double angle = atan2(dy, dx);

      // Convert angle (range -pi to pi) to color (range 0 to 255)
      int color = (angle + M_PI) / (2 * M_PI) * 255;
      
      // Use the color for the red and green channels, and the distance for the blue channel
      *((Uint32*)screen->pixels + i * 256 + j) = SDL_MapRGBA(screen->format, color, color, 255 - distance, 255);
    }
  }
  
  if (SDL_MUSTLOCK(screen)) SDL_UnlockSurface(screen);
  SDL_Flip(screen);

  printf("you should see a smoothly-colored square - no sharp lines but the square borders!\n");
  printf("and here is some text that should be HTML-friendly: amp: |&| double-quote: |\"| quote: |'| less-than, greater-than, html-like tags: |<cheez></cheez>|\nanother line.\n");

  SDL_Quit();

  return 0;
}