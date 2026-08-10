"""
Generate favicon.png, apple-touch-icon.png and og.png for MUJAHED-DOS.

Everything is drawn from the same 1996 palette the site uses, at a small size
and then upscaled with nearest-neighbour, so the output is genuinely blocky
instead of a smooth image pretending to be pixel art.

Run from the project root:  python tools/make-assets.py
Only needs re-running if you change the colours, the wording or the logo.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONT_PATH = ROOT / "tools" / "pressstart2p.ttf"

TEAL = (0, 128, 128)
FACE = (192, 192, 192)
WHITE = (255, 255, 255)
SHADOW = (128, 128, 128)
BLACK = (0, 0, 0)
NAVY = (0, 0, 128)
BLUE = (16, 132, 208)
MAROON = (128, 0, 0)
RED = (192, 0, 0)
GREEN = (0, 128, 0)
BRIGHT = (0, 96, 192)
YELLOW = (255, 208, 0)

SCALE = 3
BASE_W, BASE_H = 400, 210


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_PATH), size)


def bevel_out(draw: ImageDraw.ImageDraw, box, fill=FACE) -> None:
    """Raised 2px bevel: light top-left, dark bottom-right."""
    x0, y0, x1, y1 = box
    draw.rectangle(box, fill=fill)
    draw.line([(x0, y0), (x1, y0)], fill=WHITE)
    draw.line([(x0, y0), (x0, y1)], fill=WHITE)
    draw.line([(x0, y1), (x1, y1)], fill=BLACK)
    draw.line([(x1, y0), (x1, y1)], fill=BLACK)
    draw.line([(x0 + 1, y1 - 1), (x1 - 1, y1 - 1)], fill=SHADOW)
    draw.line([(x1 - 1, y0 + 1), (x1 - 1, y1 - 1)], fill=SHADOW)


def bevel_in(draw: ImageDraw.ImageDraw, box, fill=WHITE) -> None:
    """Sunken 2px bevel, used for text areas."""
    x0, y0, x1, y1 = box
    draw.rectangle(box, fill=fill)
    draw.line([(x0, y0), (x1, y0)], fill=SHADOW)
    draw.line([(x0, y0), (x0, y1)], fill=SHADOW)
    draw.line([(x0, y1), (x1, y1)], fill=WHITE)
    draw.line([(x1, y0), (x1, y1)], fill=WHITE)


# The M monogram, matching the `monogram` sprite in src/sprites.ts.
# Deliberately not a four-square flag: this site is not Windows and must not
# borrow anyone else's mark.
MONOGRAM = [
    "..............",
    "..............",
    ".ww......ww...",
    ".www....www...",
    ".wwww..wwww...",
    ".ww.wwww.ww...",
    ".ww..ww..ww...",
    ".ww......ww...",
    ".ww......ww...",
    ".ww......ww...",
    ".ww......ww...",
    "..............",
]


def logo(draw: ImageDraw.ImageDraw, x: int, y: int, cell: int) -> None:
    """The M monogram on its navy plate."""
    rows, cols = len(MONOGRAM), len(MONOGRAM[0])
    draw.rectangle([x, y, x + cols * cell - 1, y + rows * cell - 1], fill=NAVY)
    for row, line in enumerate(MONOGRAM):
        for col, ch in enumerate(line):
            if ch == "w":
                left = x + col * cell
                top = y + row * cell
                draw.rectangle([left, top, left + cell - 1, top + cell - 1], fill=WHITE)


def chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, size: int = 8) -> int:
    f = font(size)
    width = draw.textlength(text, font=f)
    box = (x, y, int(x + width + 7), y + size + 6)
    draw.rectangle(box, fill=FACE)
    draw.line([(box[0], box[1]), (box[2], box[1])], fill=WHITE)
    draw.line([(box[0], box[1]), (box[0], box[3])], fill=WHITE)
    draw.line([(box[0], box[3]), (box[2], box[3])], fill=SHADOW)
    draw.line([(box[2], box[1]), (box[2], box[3])], fill=SHADOW)
    draw.text((x + 4, y + 3), text, font=f, fill=BLACK)
    return box[2] + 5


def scanlines(image: Image.Image, pitch: int = 3, alpha: int = 26) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(0, image.size[1], pitch):
        draw.line([(0, y), (image.size[0], y)], fill=(0, 0, 0, alpha))
    return Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")


def build_og() -> None:
    img = Image.new("RGB", (BASE_W, BASE_H), TEAL)
    d = ImageDraw.Draw(img)

    # desktop dither so the background is not a flat slab
    for y in range(0, BASE_H, 4):
        for x in range((y // 4) % 2 * 4, BASE_W, 8):
            d.rectangle([x, y, x + 3, y + 3], fill=(0, 120, 120))

    # drop shadow, then the window
    d.rectangle([30, 28, 374, 152], fill=(0, 70, 70))
    bevel_out(d, (28, 26, 372, 150))

    # title bar
    for i in range(32, 369):
        t = (i - 32) / (369 - 32)
        d.line(
            [(i, 30), (i, 46)],
            fill=(
                int(NAVY[0] + (BLUE[0] - NAVY[0]) * t),
                int(NAVY[1] + (BLUE[1] - NAVY[1]) * t),
                int(NAVY[2] + (BLUE[2] - NAVY[2]) * t),
            ),
        )
    logo(d, 36, 33, 1)
    d.text((56, 34), "MUJAHED-DOS", font=font(8), fill=WHITE)

    # window body
    bevel_in(d, (32, 50, 368, 146))
    d.text((46, 62), "MUJAHED", font=font(16), fill=BLACK)
    d.text((46, 82), "ISSA", font=font(16), fill=BLACK)
    d.text((46, 108), "DATA ANALYST", font=font(8), fill=NAVY)
    d.text((46, 126), "ISTANBUL", font=font(8), fill=MAROON)

    x = 210
    for label in ("PYTHON", "SQL"):
        x = chip(d, x, 104, label)
    chip(d, 210, 122, "POWER BI")

    # taskbar
    bevel_out(d, (0, 188, BASE_W - 1, BASE_H - 1))
    bevel_out(d, (3, 192, 60, 206))
    logo(d, 7, 196, 1)
    d.text((24, 196), "START", font=font(6), fill=BLACK)

    img = img.resize((BASE_W * SCALE, BASE_H * SCALE), Image.NEAREST)
    img = scanlines(img)
    img.save(PUBLIC / "og.png", optimize=True)
    print(f"og.png            {img.size[0]}x{img.size[1]}")


def build_icons() -> None:
    # 16x16 master, drawn once, scaled up with nearest neighbour
    master = Image.new("RGB", (16, 16), TEAL)
    d = ImageDraw.Draw(master)
    d.rectangle([1, 1, 14, 14], fill=NAVY)
    logo(d, 1, 2, 1)

    master.resize((32, 32), Image.NEAREST).save(PUBLIC / "favicon.png")
    master.resize((180, 180), Image.NEAREST).save(PUBLIC / "apple-touch-icon.png")
    print("favicon.png       32x32")
    print("apple-touch-icon  180x180")

    rects = [
        f'<rect x="{col + 1}" y="{row + 2}" width="1" height="1" fill="#ffffff"/>'
        for row, line in enumerate(MONOGRAM)
        for col, ch in enumerate(line)
        if ch == "w"
    ]
    svg = "\n".join(
        [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">',
            '<rect width="16" height="16" fill="#008080"/>',
            '<rect x="1" y="1" width="14" height="14" fill="#000080"/>',
            *rects,
            "</svg>",
            "",
        ]
    )
    (PUBLIC / "favicon.svg").write_text(svg, encoding="utf-8")
    print("favicon.svg       vector")


if __name__ == "__main__":
    if not FONT_PATH.exists():
        raise SystemExit(f"Missing font: {FONT_PATH}")
    PUBLIC.mkdir(exist_ok=True)
    build_icons()
    build_og()
