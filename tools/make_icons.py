#!/usr/bin/env python3
"""Generates icons/icon{16,32,48,128}.png: amber gauge with needle on a rounded ink-navy square.
Stdlib only (zlib + struct). Run from anywhere: python3 tools/make_icons.py"""
import math, os, struct, zlib

BG_TOP = (28, 44, 82)
BG_BOT = (16, 26, 52)      # ~#14213D toward the bottom
AMBER = (245, 165, 36)
NEEDLE = (250, 247, 240)
SS = 4  # supersampling per axis


def inside_square(x, y):
    r = 0.22
    cx = min(max(x, r), 1 - r)
    cy = min(max(y, r), 1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def shapes(size):
    """Stroke widths grow at small sizes so the 16px icon stays legible."""
    if size <= 16:
        return dict(R=0.31, w=0.17, nw=0.15, hub=0.12, ticks=False)
    if size <= 32:
        return dict(R=0.31, w=0.13, nw=0.115, hub=0.095, ticks=False)
    return dict(R=0.31, w=0.105, nw=0.085, hub=0.08, ticks=True)


CX, CY = 0.5, 0.64
ANG = math.radians(40)  # needle angle above the horizontal, pointing up-right


def classify(x, y, p):
    """Returns 'amber', 'needle' or None for a point in the unit square."""
    nx, ny = CX + 0.27 * math.cos(ANG), CY - 0.27 * math.sin(ANG)
    if math.hypot(x - CX, y - CY) <= p["hub"]:
        return "amber"
    if seg_dist(x, y, CX, CY, nx, ny) <= p["nw"] / 2:
        return "needle"
    d = math.hypot(x - CX, y - CY)
    half = p["w"] / 2
    if abs(d - p["R"]) <= half and y <= CY:
        return "amber"
    for ex in (CX - p["R"], CX + p["R"]):  # round caps
        if math.hypot(x - ex, y - CY) <= half:
            return "amber"
    if p["ticks"]:
        for deg in (60, 90, 120):  # minor ticks inside the arc
            a = math.radians(deg)
            x0, y0 = CX + (p["R"] - 0.085) * math.cos(a), CY - (p["R"] - 0.085) * math.sin(a)
            x1, y1 = CX + (p["R"] - 0.14) * math.cos(a), CY - (p["R"] - 0.14) * math.sin(a)
            if seg_dist(x, y, x0, y0, x1, y1) <= 0.012:
                return "amber"
    return None


def render(size):
    p = shapes(size)
    rows = []
    n = SS * SS
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            sq = am = nd = 0
            for sy in range(SS):
                for sx in range(SS):
                    x = (px + (sx + 0.5) / SS) / size
                    y = (py + (sy + 0.5) / SS) / size
                    if inside_square(x, y):
                        sq += 1
                        c = classify(x, y, p)
                        if c == "amber":
                            am += 1
                        elif c == "needle":
                            nd += 1
            if sq == 0:
                row += bytes([0, 0, 0, 0])
                continue
            yy = (py + 0.5) / size
            bg = [BG_TOP[i] * (1 - yy) + BG_BOT[i] * yy for i in range(3)]
            ta, tn = am / sq, nd / sq
            col = [round(bg[i] * (1 - ta - tn) + AMBER[i] * ta + NEEDLE[i] * tn) for i in range(3)]
            row += bytes(col + [round(255 * sq / n)])
        rows.append(bytes(row))
    return b"".join(rows)


def png(size):
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
            + chunk(b"IDAT", zlib.compress(render(size), 9)) + chunk(b"IEND", b""))


out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
os.makedirs(out, exist_ok=True)
for s in (16, 32, 48, 128):
    with open(os.path.join(out, "icon%d.png" % s), "wb") as f:
        f.write(png(s))
    print("wrote icon%d.png" % s)
