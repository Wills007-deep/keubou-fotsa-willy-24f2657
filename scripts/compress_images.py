import os
from PIL import Image

def compress_images(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            filepath = os.path.join(directory, filename)
            # Open the image
            with Image.open(filepath) as img:
                # Construct output path
                webp_path = os.path.splitext(filepath)[0] + ".webp"
                # Save as WebP with 80% quality
                img.save(webp_path, "WEBP", quality=80)
                print(f"Converted {filename} to {os.path.basename(webp_path)} ({os.path.getsize(webp_path)//1024}KB)")

if __name__ == "__main__":
    # Path to frontend public images
    target_dir = "/home/will-s-dev/Desktop/AgroAnalytics/frontend/public"
    if os.path.exists(target_dir):
        print(f"Compressing images in {target_dir}...")
        try:
            compress_images(target_dir)
            print("Compression complete. Don't forget to update the code references to .webp!")
        except ImportError:
            print("Error: Pillow is not installed. Run 'pip install Pillow' first.")
        except Exception as e:
            print(f"An error occurred: {e}")
    else:
        print(f"Directory {target_dir} not found.")
