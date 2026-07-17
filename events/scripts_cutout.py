import glob, os
from PIL import Image
from rembg import remove, new_session

Image.MAX_IMAGE_PIXELS = None
root = os.path.dirname(__file__)
src_dir = os.path.join(root, "moathren web", "images")   # high-res originals
out_dir = os.path.join(root, "images")
MAX_H = 1600  # higher res than before; WebP keeps it light

session = new_session("birefnet-portrait")
files = sorted(glob.glob(os.path.join(src_dir, "*.jpg")))
print(f"{len(files)} images", flush=True)
for i, f in enumerate(files, 1):
    base = os.path.splitext(os.path.basename(f))[0]
    img = Image.open(f).convert("RGBA")
    cut = remove(img, session=session)
    w, h = cut.size
    if h > MAX_H:
        cut = cut.resize((round(w * MAX_H / h), MAX_H), Image.LANCZOS)
    out = os.path.join(out_dir, base + ".webp")
    cut.save(out, "WEBP", quality=90, method=6)
    kb = os.path.getsize(out) // 1024
    print(f"[{i}/{len(files)}] {base}.webp {cut.size[0]}x{cut.size[1]} {kb}KB", flush=True)
print("DONE", flush=True)
