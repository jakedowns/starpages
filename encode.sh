#!/bin/bash

# Path to your video file
input_video="/mnt/c/Users/mail/Downloads/8382c4ae-83d5-cb2c-195b-ebf39aa9f32a.webm"
output_video="output.mp4"

# First pass
ffmpeg -y -i "$input_video" -r 60 -c:v libx264 -preset slow -b:v 2000k -pass 1 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -an -f mp4 /dev/null

# Second pass
ffmpeg -i "$input_video" -r 60 -c:v libx264 -preset slow -b:v 2000k -pass 2 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:a aac -b:a 128k "$output_video"
