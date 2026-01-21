# from PIL import Image, ImageDraw, ImageFont

# # Create icons with different sizes
# sizes = [16, 48, 128]
# colors = [(26, 115, 232), (52, 168, 83), (251, 188, 4)]  # Blue, Green, Yellow

# for size in sizes:
#     img = Image.new('RGB', (size, size), color=colors[sizes.index(size) % 3])
#     draw = ImageDraw.Draw(img)
    
#     # Draw a simple rocket emoji-like shape
#     draw.ellipse([size//4, size//4, 3*size//4, 3*size//4], fill='white')
    
#     img.save(f'icons/icon{size}.png')
#     print(f'Created icon{size}.png')
