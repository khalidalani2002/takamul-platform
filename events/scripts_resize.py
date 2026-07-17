import glob, os
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
src_dir = os.path.join(os.path.dirname(__file__), "images")
MAX_H = 1200  # card shows ~300px wide; 1200 tall is plenty for retina

for f in sorted(glob.glob(os.path.join(src_dir, "*.png"))):
    img = Image.open(f).convert("RGBA")
    w, h = img.size
    if h > MAX_H:
        nw = round(w * MAX_H / h)
        img = img.resize((nw, MAX_H), Image.LANCZOS)
    img.save(f, optimize=True)
    kb = os.path.getsize(f) // 1024
    print(f"{os.path.basename(f)}: {img.size[0]}x{img.size[1]}  {kb} KB", flush=True)

print("DONE", flush=True)
