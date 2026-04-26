#!/usr/bin/env python3
"""WebP encode for 2nd / 3rd summary PNGs (requires Pillow: pip install Pillow)."""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
QUALITY = 82


def save_webp(src: Path, dst: Path, *, max_w: int | None = None, max_h: int | None = None) -> tuple[int, int]:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    if max_w is not None and w > max_w:
        nh = max(1, round(h * max_w / w))
        im = im.resize((max_w, nh), Image.Resampling.LANCZOS)
        w, h = im.size
    if max_h is not None and h > max_h:
        nw = max(1, round(w * max_h / h))
        im = im.resize((nw, max_h), Image.Resampling.LANCZOS)
    im.save(dst, "WEBP", quality=QUALITY, method=6)
    return im.size


def main() -> None:
    jobs = [
        (PUBLIC / "ladder-summary2.png", PUBLIC / "ladder-summary2.webp", {"max_w": 1280}),
        (PUBLIC / "struggle-summary3.png", PUBLIC / "struggle-summary3.webp", {"max_h": 1280}),
    ]
    for src, dst, kw in jobs:
        if not src.is_file():
            print(f"Skip (missing): {src.name}")
            continue
        out_w, out_h = save_webp(src, dst, **kw)
        in_sz = src.stat().st_size
        out_sz = dst.stat().st_size
        print(f"{dst.name}: {out_w}×{out_h} WebP — {in_sz // 1024} KB PNG → {out_sz // 1024} KB WebP")


if __name__ == "__main__":
    main()
