#!/usr/bin/env python3
"""Resize + WebP encode for the first summary screen map (requires Pillow: pip install Pillow)."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/world-map-summary.png"
DST = ROOT / "public/world-map-summary.webp"
MAX_W = 1280
QUALITY = 82

im = Image.open(SRC).convert("RGBA")
w, h = im.size
if w > MAX_W:
    nh = max(1, round(h * MAX_W / w))
    im = im.resize((MAX_W, nh), Image.Resampling.LANCZOS)
im.save(DST, "WEBP", quality=QUALITY, method=6)
in_sz = SRC.stat().st_size
out_sz = DST.stat().st_size
print(f"Optimized map: {im.size[0]}×{im.size[1]} WebP")
print(f"  {in_sz // 1024} KB PNG → {out_sz // 1024} KB WebP")
