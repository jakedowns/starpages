import numpy as np
import matplotlib.pyplot as plt

def generate_random_image(width, height):
    """Generate a random RGB image."""
    return np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)

def brightness(pixel):
    """Calculate the brightness of a pixel."""
    return np.sum(pixel) / 3

def sort_pixels(image, iteration, total_iterations):
    """Sort a portion of the image based on pixel brightness."""
    height, width, _ = image.shape
    portion_height = height // total_iterations
    start_row = iteration * portion_height
    end_row = min((iteration + 1) * portion_height, height)

    for row in range(start_row, end_row):
        sorted_row = sorted(image[row, :, :], key=brightness)
        image[row, :, :] = sorted_row

    return image

# Parameters
width, height = 256, 256
total_iterations = 10

# Generate a random image
image = generate_random_image(width, height)

# Iteratively apply the sorting algorithm and display the progress
plt.figure(figsize=(10, 10))
for iteration in range(total_iterations):
    sort_pixels(image, iteration, total_iterations)
    plt.subplot(1, total_iterations, iteration + 1)
    plt.imshow(image)
    plt.axis('off')

plt.tight_layout()
# plt.show()


import cv2

def create_pixel_sorting_video(image, total_iterations, output_file):
    height, width, _ = image.shape
    # Define the codec and create a VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_file, fourcc, 20.0, (width, height))

    for iteration in range(total_iterations):
        # Apply sorting to a portion of the image
        sort_pixels(image, iteration, total_iterations)
        # Write the frame
        out.write(cv2.cvtColor(image, cv2.COLOR_RGB2BGR))

    # Release everything when the job is finished
    out.release()

# Parameters for the video
total_iterations_for_video = 100  # More iterations for a smoother video
output_video_file = '/g/Code/neat-starpages/starpages/pixel_sorting_simulation.mp4'

# Generate a new random image
image_for_video = generate_random_image(width, height)

# Create the pixel sorting video
create_pixel_sorting_video(image_for_video, total_iterations_for_video, output_video_file)

output_video_file

def rgb_to_hsv(pixel):
    """Convert an RGB pixel to HSV."""
    return cv2.cvtColor(np.uint8([[pixel]]), cv2.COLOR_RGB2HSV)[0][0]

def sort_pixels_by_hue(image, iteration, total_iterations):
    """Sort a portion of the image based on pixel hue."""
    height, width, _ = image.shape
    portion_height = height // total_iterations
    start_row = iteration * portion_height
    end_row = min((iteration + 1) * portion_height, height)

    for row in range(start_row, end_row):
        # Convert each pixel in the row to HSV and sort by hue
        sorted_row = sorted(image[row, :, :], key=lambda pixel: rgb_to_hsv(pixel)[0])
        image[row, :, :] = sorted_row

    return image

def create_hue_sorted_video(image, total_iterations, output_file, fps):
    height, width, _ = image.shape
    # Define the codec and create a VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_file, fourcc, fps, (width, height))

    for iteration in range(total_iterations):
        # Apply hue-based sorting to a portion of the image
        sort_pixels_by_hue(image, iteration, total_iterations)
        # Write the frame
        out.write(cv2.cvtColor(image, cv2.COLOR_RGB2BGR))

    out.release()

# New parameters for the hue-based sorting video
fps = 120
duration = 30  # seconds
total_iterations_for_hue_video = fps * duration
output_hue_video_file = '/g/Code/neat-starpages/starpages/hue_sorted_simulation.mp4'

# Generate a new random image
image_for_hue_video = generate_random_image(width, height)

# Create the hue-sorted video
create_hue_sorted_video(image_for_hue_video, total_iterations_for_hue_video, output_hue_video_file, fps)

output_hue_video_file
