from PIL import Image, ImageOps
import glob, os

Image.MAX_IMAGE_PIXELS = None
root = os.path.dirname(__file__)
out_dir = os.path.join(root, "images")
os.makedirs(out_dir, exist_ok=True)

# 1) Logo: black-on-white artwork -> white wordmark on transparent
logo_src = r"C:\Users\khm87\Desktop\tk photo\ssddd.png"
im = Image.open(logo_src).convert("L")
alpha = ImageOps.invert(im)                 # black art -> opaque, white bg -> transparent
logo = Image.new("RGBA", im.size, (255, 255, 255, 0))
logo.putalpha(alpha)
bbox = alpha.getbbox()
if bbox:
    logo = logo.crop(bbox)
logo.save(os.path.join(out_dir, "logo.png"))
print("logo", logo.size)

# 2) Revert Muathren photos to their original WHITE background, kept at 1600px
src_dir = os.path.join(root, "moathren web", "images")
MAX_H = 1600
for f in sorted(glob.glob(os.path.join(src_dir, "*.jpg"))):
    base = os.path.splitext(os.path.basename(f))[0]
    img = Image.open(f).convert("RGB")
    w, h = img.size
    if h > MAX_H:
        img = img.resize((round(w * MAX_H / h), MAX_H), Image.LANCZOS)
    img.save(os.path.join(out_dir, base + ".webp"), "WEBP", quality=90, method=6)
    print(base + ".webp", img.size)
print("DONE")
