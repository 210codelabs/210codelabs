"""Shield-style badge artwork renderer (Pillow). Pure function of the `art` dict."""
from __future__ import annotations

import io
import json
import math
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter
from PIL.PngImagePlugin import PngInfo


# ---------------------------------------------------------------- artwork
S = 1200  # render size; downscaled to 600 for smooth edges
FONT_DIR = Path(__file__).parent / "assets" / "fonts"  # bundled (Liberation Sans, SIL OFL) so production needs no system fonts
_SYSTEM_FONT_DIR = Path("/usr/share/fonts/truetype/liberation")
NAVY, NAVY_2, BLUE, BLUE_2 = (10, 29, 68), (19, 53, 127), (20, 80, 216), (14, 58, 168)
ICE, SKY, SILVER_1, SILVER_2 = (245, 248, 254), (159, 186, 240), (226, 233, 245), (128, 148, 184)


@lru_cache(maxsize=256)
def _font(size: int, bold: bool = True, serif: bool = False) -> ImageFont.FreeTypeFont:
    name = f"LiberationSans-{'Bold' if bold else 'Regular'}.ttf"
    for d in (FONT_DIR, _SYSTEM_FONT_DIR):
        if (d / name).exists():
            return ImageFont.truetype(str(d / name), size)
    return ImageFont.load_default(size=size)  # last resort: never fail the badge image


def _shield_points(inset: float = 0) -> list:
    l, r, top, side_bottom, tip = 150 + inset, 1050 - inset, 60 + inset, 690, 1150 - inset * 1.4
    pts = [(l + 40, top), (r - 40, top), (r, top + 40), (r, side_bottom)]
    # right curve to the tip (quadratic bezier)
    for i in range(1, 41):
        t = i / 40
        x = (1 - t) ** 2 * r + 2 * (1 - t) * t * r + t * t * 600
        y = (1 - t) ** 2 * side_bottom + 2 * (1 - t) * t * (side_bottom + 300) + t * t * tip
        pts.append((x, y))
    for i in range(1, 41):
        t = i / 40
        x = (1 - t) ** 2 * 600 + 2 * (1 - t) * t * l + t * t * l
        y = (1 - t) ** 2 * tip + 2 * (1 - t) * t * (side_bottom + 300) + t * t * side_bottom
        pts.append((x, y))
    pts += [(l, top + 40)]
    return pts


def _vgradient(size, c1, c2) -> Image.Image:
    w, h = size
    g = Image.new("RGBA", (1, h))
    for y in range(h):
        t = y / max(h - 1, 1)
        g.putpixel((0, y), tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,))
    return g.resize((w, h))


def _fill_poly(canvas: Image.Image, pts, c1, c2):
    mask = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(mask).polygon(pts, fill=255)
    canvas.paste(_vgradient(canvas.size, c1, c2), (0, 0), mask)


def _spaced(draw, xy_center, text, font, fill, spacing=0):
    total = sum(font.getlength(ch) for ch in text) + spacing * (len(text) - 1)
    x = xy_center[0] - total / 2
    for ch in text:
        draw.text((x, xy_center[1]), ch, font=font, fill=fill, anchor="lm")
        x += font.getlength(ch) + spacing


def _fit(text, max_w, size, bold=True, spacing=0, min_size=20):
    while size > min_size:
        f = _font(size, bold)
        if sum(f.getlength(ch) for ch in text) + spacing * (len(text) - 1) <= max_w:
            return f
        size -= 2
    return _font(min_size, bold)


def _arc_text(canvas, text, center, radius, color, bottom=False, max_deg=150, size=30):
    cx, cy = center
    while size > 12:
        font = _font(size)
        widths = [font.getlength(ch) for ch in text]
        total = sum(widths) + 2 * (len(text) - 1)
        if math.degrees(total / radius) <= max_deg:
            break
        size -= 1
    span = total / radius
    a = (math.pi / 2 + span / 2) if bottom else (-math.pi / 2 - span / 2)
    for ch, w in zip(text, widths):
        step = (w + 2) / radius
        mid = a - step / 2 if bottom else a + step / 2
        x, y = cx + radius * math.cos(mid), cy + radius * math.sin(mid)
        deg = math.degrees(mid)
        rot = (90 - deg) if bottom else -(deg + 90)
        g = Image.new("RGBA", (int(w) + 12, size + 16), (0, 0, 0, 0))
        ImageDraw.Draw(g).text((g.width / 2, g.height / 2), ch, font=font, fill=color, anchor="mm")
        g = g.rotate(rot, resample=Image.BICUBIC, expand=True)
        canvas.alpha_composite(g, (int(x - g.width / 2), int(y - g.height / 2)))
        a = a - step if bottom else a + step


# Uploaded institution logos (immutable by id): id -> PNG bytes. Filled by the caller before rendering.
LOGOS: dict = {}


def _logo_seal(canvas, center, r, logo_bytes: bytes):
    """Official logo inside a white disc with the metallic rim (logo is contain-fit + circle-clipped)."""
    cx, cy = center
    d = ImageDraw.Draw(canvas)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255), outline=SILVER_2, width=6)
    inner = r - 10
    logo = Image.open(io.BytesIO(logo_bytes)).convert("RGBA")
    box = int(inner * 2 * 0.86)  # keep corners of square logos inside the circle
    logo.thumbnail((box, box), Image.LANCZOS)
    disc = Image.new("RGBA", (inner * 2, inner * 2), (255, 255, 255, 0))
    disc.alpha_composite(logo, ((inner * 2 - logo.width) // 2, (inner * 2 - logo.height) // 2))
    mask = Image.new("L", disc.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, inner * 2 - 1, inner * 2 - 1), fill=255)
    clipped = Image.new("RGBA", disc.size, (0, 0, 0, 0))
    clipped.paste(disc, (0, 0), mask)
    canvas.alpha_composite(clipped, (int(cx - inner), int(cy - inner)))
    d = ImageDraw.Draw(canvas)
    d.ellipse((cx - r + 4, cy - r + 4, cx + r - 4, cy + r - 4), outline=(214, 224, 240), width=2)


def _seal(canvas, center, r, abbr, top_text, bottom_text, logo_id=None):
    d = ImageDraw.Draw(canvas)
    cx, cy = center
    # soft shadow
    sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse((cx - r, cy - r + 10, cx + r, cy + r + 10), fill=(0, 0, 0, 110))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    if logo_id and LOGOS.get(logo_id):
        _logo_seal(canvas, center, r, LOGOS[logo_id])
        return
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=ICE, outline=SILVER_2, width=6)
    d.ellipse((cx - r + 14, cy - r + 14, cx + r - 14, cy + r - 14), outline=BLUE, width=5)
    inner = r - 56
    d.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), outline=BLUE, width=3)
    _arc_text(canvas, top_text, center, r - 35, NAVY, bottom=False, max_deg=150)
    _arc_text(canvas, bottom_text, center, r - 35, NAVY, bottom=True, max_deg=130)
    for ang in (0, 180):  # small separator stars on the ring
        x = cx + (r - 35) * math.cos(math.radians(ang))
        y = cy + (r - 35) * math.sin(math.radians(ang))
        d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=BLUE)
    f = _fit(abbr, inner * 1.6, 84 if len(abbr) <= 3 else 56)
    d.text((cx, cy), abbr, font=f, fill=NAVY, anchor="mm")


def render_art(art: dict) -> bytes:
    """Render a 600x600 PNG. `art` keys: kicker, lines[], sub, seal_abbr, seal_top, seal_bottom,
    seal_logo_id, seal2 (optional dict: abbr, top, bottom, logo_id), ribbon, ribbon_sub.
    Logo ids must already be loaded into LOGOS (ids are immutable, so they are safe cache keys)."""
    ids = [art.get("seal_logo_id"), (art.get("seal2") or {}).get("logo_id")]
    key = {**art, "_logos_loaded": [i for i in ids if i and i in LOGOS]}
    return _render_cached(json.dumps(key, sort_keys=True))


@lru_cache(maxsize=64)
def _render_cached(art_json: str) -> bytes:
    art = json.loads(art_json)
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    # drop shadow
    sh = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(sh).polygon([(x, y + 14) for x, y in _shield_points()], fill=(6, 18, 44, 120))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(14)))
    _fill_poly(canvas, _shield_points(), SILVER_1, SILVER_2)          # metallic rim
    _fill_poly(canvas, _shield_points(22), BLUE, NAVY)                # blue edge
    _fill_poly(canvas, _shield_points(34), NAVY_2, NAVY)              # navy field
    d = ImageDraw.Draw(canvas)

    # 210Codelabs logo + validation line
    logo_path = Path(__file__).parent / "assets" / "brand-logo-footer-metallic.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        lw = 440
        logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
        canvas.alpha_composite(logo, (int(S / 2 - lw / 2), 112))
    _spaced(d, (S / 2, 248), "VALIDATED BY 210CODELABS", _font(26), SKY, spacing=6)
    d.line((330, 280, 870, 280), fill=(60, 96, 170), width=2)

    # seals
    s2 = art.get("seal2") or None
    if s2 and (s2.get("abbr") or s2.get("logo_id")):
        _seal(canvas, (445, 430), 128, art.get("seal_abbr", ""), art.get("seal_top", ""), art.get("seal_bottom", ""), art.get("seal_logo_id"))
        _seal(canvas, (755, 430), 128, s2["abbr"], s2.get("top", ""), s2.get("bottom", ""), s2.get("logo_id"))
    else:
        _seal(canvas, (S / 2, 432), 138, art.get("seal_abbr", ""), art.get("seal_top", ""), art.get("seal_bottom", ""), art.get("seal_logo_id"))

    # degree text
    _spaced(d, (S / 2, 612), art.get("kicker", ""), _font(34), SKY, spacing=7)
    y = 680
    for line in [x for x in (art.get("lines") or []) if x][:2]:
        f = _fit(line, 700, 66)
        d.text((S / 2, y), line, font=f, fill=(255, 255, 255), anchor="mm")
        y += 72
    _spaced(d, (S / 2, y + 2), art.get("sub", ""), _font(26, bold=False), (196, 210, 238), spacing=4)

    # ribbon
    ry, rh = 880, 112
    tail = [(110, ry + 26), (200, ry + 26), (200, ry + rh + 26), (110, ry + rh + 26), (145, ry + rh / 2 + 26)]
    tail_r = [(S - x, y) for x, y in tail]
    d.polygon(tail, fill=BLUE_2)
    d.polygon(tail_r, fill=BLUE_2)
    d.polygon([(200, ry + rh), (200, ry + rh + 26), (232, ry + rh)], fill=(8, 30, 90))
    d.polygon([(S - 200, ry + rh), (S - 200, ry + rh + 26), (S - 232, ry + rh)], fill=(8, 30, 90))
    canvas.paste(_vgradient((S - 400, rh), (46, 108, 240), BLUE_2), (200, ry))
    d = ImageDraw.Draw(canvas)
    d.rectangle((200, ry, S - 200, ry + rh), outline=(120, 160, 245), width=3)
    _spaced(d, (S / 2, ry + 42), art.get("ribbon", ""), _fit(art.get("ribbon", ""), 720, 46), (255, 255, 255), spacing=3)
    _spaced(d, (S / 2, ry + 84), art.get("ribbon_sub", ""), _font(24), (214, 226, 255), spacing=4)

    _spaced(d, (S / 2, 1052), "OPEN BADGE", _font(20), SKY, spacing=5)

    out = canvas.resize((600, 600), Image.LANCZOS)
    buf = io.BytesIO()
    out.save(buf, "PNG", optimize=True)
    return buf.getvalue()



def bake_png(png_bytes: bytes, assertion_url: str) -> bytes:
    img = Image.open(io.BytesIO(png_bytes))
    info = PngInfo()
    info.add_itxt("openbadges", assertion_url, zip=False)
    buf = io.BytesIO()
    img.save(buf, "PNG", pnginfo=info)
    return buf.getvalue()
