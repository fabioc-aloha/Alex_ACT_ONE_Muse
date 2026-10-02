---
name: annotate-screenshot
description: "Add callouts to a raster you did not author, using Pillow, at a resolution that stays legible. Covers upscale-then-annotate ordering, supersampled shape rendering, measured callout placement, color and font conventions, and the render-and-look check. Use when marking up a screenshot, dashboard capture, chart image, or any PNG or JPG whose source resolution you do not control. Pillow is the only dependency. Muse delta: the upscale-before-drawing resolution pipeline and the supersampled-shape + measured-placement procedures — none of which Muse does natively."
lastReviewed: 2026-08-18
---

# Annotate Screenshot

## Muse delta

- **Native to Muse:** opening and looking at an image, and running Python with Pillow.
- **What this skill uniquely adds:** the **upscale-then-annotate ordering rule**, **supersampled shape rendering** (Pillow doesn't anti-alias shapes), **measured (not eyeballed) callout placement**, the **render-and-look verification loop**, and the color/font conventions below.
- **Load when:** marking up a screenshot, dashboard capture, chart image, or any PNG/JPG whose source resolution you do not control.

```bash
pip install Pillow -q
```

Not for artifacts you can regenerate. If you own the generator, put the callout in the source and re-render — a vector figure beats any raster markup. See [`figure-generator`](../figure-generator/SKILL.md).

## Rule 1: fix the resolution before you draw, never after

The annotation layer is resolution independent. The image underneath is not. Draw at the output size and the text is crisp; draw small and enlarge afterwards and the text is resampled mush no filter recovers.

| Situation | Do this |
| --- | --- |
| You control the capture | Capture at HiDPI, 150–200%. No resampling, genuinely sharp |
| Source is fixed and too small | Upscale the base with `Image.LANCZOS`, then annotate on top |
| Never | Annotate at 1x and upscale the composite |

Upscaling makes an image smoother, never sharper — say so in the caption. Read what you have before deciding: a HiDPI capture is larger than it looks and usually needs no upscale. Judge usable resolution from pixel dimensions and intended display size.

```python
im = Image.open(path)
print(im.size, im.info.get("dpi"))   # DPI metadata is a hint, not proof of capture scale
```

## Rule 2: supersample the shapes, draw the text once

Pillow does not anti-alias `ellipse`, `line`, or `arc`. Draw shapes oversized on a transparent layer and reduce with LANCZOS. Text is the exception: FreeType anti-aliases `truetype` glyphs natively, so draw text once at final size (sharper and cheaper than supersampled text).

Supersampled circles have no jagged edges — shape choice becomes a design decision, not a workaround.

## Rule 3: measure the coordinates, do not place them by eye

Eyeballed callouts land near the right feature and miss some. When the marks carry an argument, detect the features: flood fill connected components of the marker color, filter by size and squareness, take the centroids.

Calibrate against something the image already states: if a labeled value computes back from your pixel mapping to the number printed on the chart, the coordinate system is verified. For an unfamiliar image, overlay a coordinate grid first — scaled previews lie about pixel positions.

## Rule 4: render, then look at it

Annotation defects are invisible in code and obvious in the picture. Open the output every time, per [`render-verify`](../render-verify/SKILL.md):

- Does a badge cover the thing it points at?
- Did an emphasis line obscure the feature being criticized?
- Is the notes strip tall enough, or is the last line clipped?
- Do the marks sit on the features, or one position off?

Guard what code can check so the eye only catches the rest:

```python
assert content_bottom <= canvas.height, f"notes clipped: {content_bottom} of {canvas.height}"
```

## Conventions

| Element | Convention |
| --- | --- |
| Red `#E63946` | Bad or removed only. Never for emphasis, or it stops meaning anything |
| Orange `#FF9F1C` | Neutral "look here" |
| Font | A handwritten-look font where available (e.g. Ink Free on Windows); `ImageFont.load_default()` elsewhere |
| Text size | ~36 on a 1400px-wide image, scaled proportionally |
| Text stroke | `stroke_width=1` with `stroke_fill` the same color as the fill. Never a white stroke (reads as a bad glow) |
| Line weight | Outline, leader, and text consistent, ~5px at 1400px wide |
| Padding | ~18px around the target so the mark breathes |
| Leader length | 25–35px — the eye should not travel to find the label |
| Label length | One to three words |

Put long-form reasoning in a notes strip below the image with numbered badges, rather than crowding sentences onto the figure.

## Reference implementation

```python
from PIL import Image, ImageDraw, ImageFont

S, SS = 3, 4                    # S: output scale. SS: extra supersampling for shapes
ORANGE, RED = (255, 159, 28), (230, 57, 70)

src = Image.open("chart.png").convert("RGB")
W, H = src.size[0] * S, src.size[1] * S
canvas = Image.new("RGB", (W, H), "white")
canvas.paste(src.resize((W, H), Image.LANCZOS), (0, 0))

# Source-pixel coordinates: target center and label anchor.
x, y = src.width * 0.50, src.height * 0.45
lx, ly = x + 30, y - 30

shapes = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
sd = ImageDraw.Draw(shapes)
k = lambda v: int(round(v * S * SS))          # source coords to supersampled coords

sd.ellipse([k(x) - k(11), k(y) - k(11), k(x) + k(11), k(y) + k(11)],
           outline=ORANGE + (255,), width=k(3))
sd.line([k(x), k(y), k(lx), k(ly)], fill=ORANGE + (255,), width=k(2))

shapes = shapes.resize((W, H), Image.LANCZOS)
canvas = Image.alpha_composite(canvas.convert("RGBA"), shapes).convert("RGB")

d = ImageDraw.Draw(canvas)                    # text goes on after compositing
font = ImageFont.truetype("DejaVuSans.ttf", 12 * S)  # fallback: ImageFont.load_default()
d.text((lx * S, ly * S), "1", fill=ORANGE, font=font, stroke_width=1, stroke_fill=ORANGE)

canvas.save("annotated.png", dpi=(96 * S, 96 * S))
```

## Anti-patterns

| Anti-pattern | Correction |
| --- | --- |
| Annotate at source size, then upscale the composite | Resampled text cannot be recovered. Upscale first |
| Upscale and assume the shapes are smooth | Bigger jagged is still jagged. Supersample the shape layer |
| Supersample the text too | Wasteful, and slightly softer than drawing once at final size |
| Place marks by eye when the callout carries a claim | Detect the features and calibrate against a printed value |
| Ship without opening the output | Covered badges and clipped captions are only visible in the render |
| Red because it stands out | Red means bad or removed. Spend it on the one or two real defects |
| White text stroke for contrast | Reads as a glow artifact. Stroke in the fill color |
| Call an upscaled base sharp | It is smooth. Say so, and ask for a HiDPI recapture |

## Attribution

Color, font, shape, and spacing conventions adapted from the `image-annotations` skill in [github/awesome-copilot](https://github.com/github/awesome-copilot) (MIT). The resolution pipeline, supersampling approach, measured placement, and verification loop are this plugin's own, developed 2026-08-18 while annotating a low-resolution dashboard capture.
