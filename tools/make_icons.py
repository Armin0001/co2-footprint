"""Draws the extension icons (a white leaf on a green rounded square) with Pillow.

    python tools/make_icons.py
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
A = 1024  # draw large, then scale down for smooth edges

# icon size -> transparent padding. Chrome Web Store wants 96px of artwork in the 128px icon.
SIZES = {16: 0, 32: 1, 48: 2, 128: 16}


def artwork():
    # Diagonal green gradient on a rounded square.
    v = Image.linear_gradient("L").resize((A, A))
    diagonal = ImageChops.add(v, v.rotate(90), scale=2.0)
    light = Image.new("RGBA", (A, A), (34, 197, 94, 255))
    dark = Image.new("RGBA", (A, A), (21, 128, 61, 255))
    icon = Image.composite(dark, light, diagonal)

    # Leaf: the lens where two circles overlap, with a midrib cut out and a stem.
    cx, cy = A / 2, A / 2 - 0.02 * A
    length, radius = 0.70 * A, 0.4375 * A
    offset = 0.6 * radius
    leaf = Image.new("L", (A, A), 0)
    circles = []
    for dx in (-offset, offset):
        c = Image.new("L", (A, A), 0)
        ImageDraw.Draw(c).ellipse([cx + dx - radius, cy - radius, cx + dx + radius, cy + radius], fill=255)
        circles.append(c)
    leaf = ImageChops.multiply(*circles)
    draw = ImageDraw.Draw(leaf)
    draw.line([(cx, cy + length * 0.36), (cx, cy - length * 0.30)], fill=0, width=round(0.032 * A))
    draw.line([(cx, cy + length * 0.40), (cx, cy + length / 2 + 0.07 * A)], fill=255, width=round(0.04 * A))
    leaf = leaf.rotate(-45, resample=Image.BICUBIC, center=(A / 2, A / 2))

    icon.paste((255, 255, 255, 255), mask=leaf)

    rounded = Image.new("L", (A, A), 0)
    ImageDraw.Draw(rounded).rounded_rectangle([0, 0, A - 1, A - 1], radius=round(0.22 * A), fill=255)
    icon.putalpha(rounded)
    return icon


def main():
    art = artwork()
    out = ROOT / "extension" / "icons"
    out.mkdir(parents=True, exist_ok=True)
    for size, pad in SIZES.items():
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        canvas.paste(art.resize((size - 2 * pad,) * 2, Image.LANCZOS), (pad, pad))
        canvas.save(out / f"icon{size}.png", optimize=True)
        print(f"wrote extension/icons/icon{size}.png")


if __name__ == "__main__":
    main()
