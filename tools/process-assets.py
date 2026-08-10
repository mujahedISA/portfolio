"""
One-off asset pipeline: turns raw source pictures into the files the site ships.

    python tools/process-assets.py <source-folder>

The source folder must contain:
    wp-cave.png  wp-cat.png  wp-dune.png      -> public/wallpapers/01..03.png
    ico-notes.png  ico-computer.png  ico-folder.png  ico-phone.png
    ico-book.png   ico-paper.png     ico-cd.png      ico-tv.png
                                                    -> public/icons/*.png

WALLPAPERS are centre-cropped to 16:9, resized to 1600x900 and quantised to 128
colours. The quantising is not just for file size — it restores the crisp,
banded look of real pixel art, which a 78,000-colour AI render does not have.

ICONS arrive as screenshots with a flat teal background behind them, and two of
them have a text label baked into the picture. This script flood-fills the
background away from the four corners, crops the label off, trims to the
artwork, and writes a square 48px PNG with a transparent background. 48 is exactly
the size the desktop draws them at, so `image-rendering: pixelated` maps one
source pixel to one screen pixel instead of dropping every fourth one.

You only need to run this again if you replace a source picture.
"""

from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

WALLPAPER_W, WALLPAPER_H = 1600, 900
WALLPAPER_COLOURS = 128
ICON_SIZE = 48

WALLPAPERS = [("wp-cave.png", "01.png"), ("wp-cat.png", "02.png"), ("wp-dune.png", "03.png")]

# name -> (source file, fraction of the height to keep)
# A value below 1.0 chops a baked-in text label off the bottom.
ICONS = {
    "notes": ("ico-notes.png", 0.72),
    "computer": ("ico-computer.png", 1.0),
    "folder": ("ico-folder.png", 1.0),
    "phone": ("ico-phone.png", 1.0),
    "book": ("ico-book.png", 1.0),
    "paper": ("ico-paper.png", 0.72),
    "cd": ("ico-cd.png", 1.0),
    "tv": ("ico-tv.png", 1.0),
    "clippy": ("ico-clippy.png", 1.0),
    "frame": ("ico-frame.png", 1.0),
}


# --------------------------------------------------------------------------- #
# wallpapers
# --------------------------------------------------------------------------- #
def build_wallpaper(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGB")

    target_width = im.height * WALLPAPER_W / WALLPAPER_H
    if im.width > target_width:
        margin = (im.width - target_width) / 2
        im = im.crop((int(margin), 0, int(im.width - margin), im.height))
    elif im.width < target_width:
        target_height = im.width * WALLPAPER_H / WALLPAPER_W
        margin = (im.height - target_height) / 2
        im = im.crop((0, int(margin), im.width, int(im.height - margin)))

    im = im.resize((WALLPAPER_W, WALLPAPER_H), Image.LANCZOS)
    im = im.quantize(colors=WALLPAPER_COLOURS, method=Image.Quantize.MEDIANCUT)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, optimize=True)
    print(f"  {dest.name:10s} {WALLPAPER_W}x{WALLPAPER_H}  {dest.stat().st_size // 1024} KB")


# --------------------------------------------------------------------------- #
# icons
# --------------------------------------------------------------------------- #
def close_enough(a: tuple[int, ...], b: tuple[int, ...], tolerance: int) -> bool:
    return sum((a[i] - b[i]) ** 2 for i in range(3)) <= tolerance * tolerance


def strip_background(im: Image.Image, tolerance: int = 72) -> Image.Image:
    """
    Flood-fill the background to transparent, starting from the four corners.

    Flood fill rather than "delete every teal pixel", so a teal-ish colour
    *inside* the artwork survives instead of being punched into a hole.
    """
    im = im.convert("RGBA")
    width, height = im.size
    pixels = im.load()

    seeds = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    reference = pixels[0, 0][:3]

    seen = set()
    queue: deque[tuple[int, int]] = deque(seeds)
    while queue:
        x, y = queue.popleft()
        if not (0 <= x < width and 0 <= y < height) or (x, y) in seen:
            continue
        seen.add((x, y))
        if not close_enough(pixels[x, y][:3], reference, tolerance):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return im


def build_icon(src: Path, dest: Path, keep_height: float) -> None:
    im = Image.open(src)

    if keep_height < 1.0:
        im = im.crop((0, 0, im.width, int(im.height * keep_height)))

    im = strip_background(im)

    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)

    # square canvas so every icon lands on the same optical size
    side = max(im.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))

    canvas = canvas.resize((ICON_SIZE, ICON_SIZE), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, optimize=True)
    print(f"  {dest.name:14s} {ICON_SIZE}x{ICON_SIZE}  {dest.stat().st_size // 1024} KB")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    source = Path(sys.argv[1])
    if not source.is_dir():
        raise SystemExit(f"Not a folder: {source}")

    print("wallpapers:")
    for src_name, out_name in WALLPAPERS:
        src = source / src_name
        if src.exists():
            build_wallpaper(src, PUBLIC / "wallpapers" / out_name)
        else:
            print(f"  skipped (missing): {src_name}")

    print("icons:")
    for name, (src_name, keep) in ICONS.items():
        src = source / src_name
        if src.exists():
            build_icon(src, PUBLIC / "icons" / f"{name}.png", keep)
        else:
            print(f"  skipped (missing): {src_name}")


if __name__ == "__main__":
    main()
