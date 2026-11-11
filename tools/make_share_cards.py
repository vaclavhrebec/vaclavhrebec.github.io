"""Render the 1200x630 link-preview cards."""
import sys, os
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]

BASE = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:G;src:url('EBGaramond[wght].ttf');font-weight:400 800}
@font-face{font-family:G;src:url('EBGaramond-Italic[wght].ttf');font-style:italic;font-weight:400 800}
@font-face{font-family:I;src:url('Inter[opsz,wght].ttf');font-weight:100 900}
@font-face{font-family:F;src:url('IMFELLDoublePica-Regular.ttf')}
@font-face{font-family:F;src:url('IMFELLDoublePica-Italic.ttf');font-style:italic}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:#faf7f2;color:#1c1a17;font-family:I;position:relative}
.staff{position:absolute;left:0;right:0;height:33px;background:repeating-linear-gradient(to bottom,#d9a3a8 0 1.4px,transparent 1.4px 8px)}
.url{position:absolute;font:500 15px/1 I;letter-spacing:.16em;text-transform:uppercase;color:#7a7268}
.dia{display:inline-block;width:11px;height:11px;background:#c8102e;transform:rotate(45deg);margin-right:14px;vertical-align:2px}
h1{font-family:G;font-weight:500;letter-spacing:-.01em;line-height:1}
.sub{font-family:G;font-style:italic;color:#6b645b}
.panel{background:#f0e6d0;border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.panel img{display:block;width:100%;height:100%;object-fit:contain}
</style></head><body>@@BODY@@</body></html>"""

CARDS = {
 'home': """
<img src="hero-lute-edoardo-gatta.jpg" style="position:absolute;left:0;top:0;width:560px;height:630px;object-fit:cover;object-position:52% 40%">
<div style="position:absolute;left:560px;top:0;bottom:0;width:4px;background:#c8102e"></div>
<div style="position:absolute;left:628px;top:150px;right:56px">
  <h1 style="font-size:86px;font-weight:600">Václav<br>Hřebec</h1>
  <p class="sub" style="font-size:31px;line-height:1.3;margin-top:26px">Music theory · improvisation ·<br>contrapunto alla mente · organ · lute</p>
</div>
<div class="staff" style="left:628px;right:56px;top:470px"></div>
<div class="url" style="left:628px;bottom:58px"><span class="dia"></span>vaclavhrebec.github.io</div>
""",
 'gym': """
<div style="position:absolute;left:64px;top:58px;right:64px">
  <h1 style="font-family:F;font-weight:400;font-size:70px">The Ultimate Counterpoint Gym</h1>
  <p class="sub" style="font-size:28px;margin-top:14px">Cantare super librum · Improvising canons · Guidonian hand</p>
</div>
<div style="position:absolute;left:64px;right:64px;top:240px;height:250px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px">
  <div class="panel"><img src="gym0.png"></div><div class="panel"><img src="gym1.png"></div><div class="panel"><img src="gym2.png"></div>
</div>
<div class="url" style="left:64px;bottom:50px"><span class="dia"></span>vaclavhrebec.github.io/gym · Václav Hřebec</div>
""",
 'cantare': """
<div style="position:absolute;left:64px;top:96px;width:560px">
  <h1 style="font-family:F;font-weight:400;font-size:76px">Cantare super librum</h1>
  <p class="sub" style="font-size:29px;line-height:1.32;margin-top:24px">Plainchant, mensural melodies and whole polyphonic pieces in their original notation, to sing and improvise against.</p>
</div>
<div class="panel" style="position:absolute;right:64px;top:110px;width:470px;height:360px"><img src="gym0.png"></div>
<div class="url" style="left:64px;bottom:50px"><span class="dia"></span>The Ultimate Counterpoint Gym · Václav Hřebec</div>
""",
 'canon': """
<div style="position:absolute;left:64px;top:96px;width:560px">
  <h1 style="font-family:F;font-weight:400;font-size:76px">Improvising canons</h1>
  <p class="sub" style="font-size:29px;line-height:1.32;margin-top:24px">Sing the dux, and the comes answers you at the unison, fourth, fifth or octave.</p>
</div>
<div class="panel" style="position:absolute;right:64px;top:110px;width:470px;height:360px"><img src="gym1.png"></div>
<div class="url" style="left:64px;bottom:50px"><span class="dia"></span>The Ultimate Counterpoint Gym · Václav Hřebec</div>
""",
 'hand': """
<div style="position:absolute;left:64px;top:96px;width:560px">
  <h1 style="font-family:F;font-weight:400;font-size:76px">Manus Guidonis</h1>
  <p class="sub" style="font-size:29px;line-height:1.32;margin-top:24px">Show a note on your hand to the camera, and hear it sung back.</p>
</div>
<div class="panel" style="position:absolute;right:64px;top:110px;width:470px;height:360px"><img src="gym2.png"></div>
<div class="url" style="left:64px;bottom:50px"><span class="dia"></span>The Ultimate Counterpoint Gym · Václav Hřebec</div>
""",
 'ear': """
<div style="position:absolute;left:64px;top:58px;right:64px">
  <h1 style="font-size:74px;font-weight:700">The Ultimate Ear Trainer</h1>
  <p class="sub" style="font-size:28px;margin-top:14px">Intervals, intonation, key signatures, rhythm, chords and scales</p>
</div>
<div style="position:absolute;left:64px;right:64px;top:236px;height:250px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px">
  <div class="panel" style="background:#f0ebe3"><img src="ear0.png"></div><div class="panel" style="background:#f0ebe3"><img src="ear1.png"></div><div class="panel" style="background:#f0ebe3"><img src="ear5.png"></div>
</div>
<div class="url" style="left:64px;bottom:50px"><span class="dia"></span>vaclavhrebec.github.io/ear · Václav Hřebec</div>
""",
 'tuning': """
<div style="position:absolute;left:64px;top:96px;width:600px">
  <h1 style="font-size:76px;font-weight:700">Tuning systems</h1>
  <p class="sub" style="font-size:29px;line-height:1.32;margin-top:24px">Pythagorean, meantone, Werckmeister, Vallotti, Neidhardt and more: how they work, how to tune them, and how they sound.</p>
</div>
<div style="position:absolute;right:64px;top:118px;width:420px;height:360px">%(wheel)s</div>
<div class="url" style="left:64px;bottom:50px"><span class="dia"></span>The Ultimate Ear Trainer · Václav Hřebec</div>
""",
 'rheinfelden': """
<div style="position:absolute;left:64px;top:78px;width:640px">
  <p style="font:500 17px/1 I;letter-spacing:.16em;text-transform:uppercase;color:#c8102e">22–28 February 2027 · Rheinfelden (CH)</p>
  <h1 style="font-size:72px;font-weight:600;margin-top:26px">Renaissance Music Course</h1>
  <p class="sub" style="font-size:29px;line-height:1.32;margin-top:22px">Improvised and written polyphony 1400–1600, mensural notation, solmisation, organ and instruments. Led by Václav Hřebec.</p>
  <p style="font:500 19px/1.3 I;margin-top:30px;color:#1c1a17">Registration until 25 January 2027</p>
</div>
<img src="rheinfelden-2027-1240.webp" style="position:absolute;right:64px;top:40px;height:550px;border-radius:6px;box-shadow:0 18px 40px -18px rgba(0,0,0,.45)">
<div class="url" style="left:64px;bottom:50px"><span class="dia"></span>vaclavhrebec.github.io/rheinfelden2027</div>
""",
}


def wheel():
    """circle of fifths with the Pythagorean comma left open"""
    import math
    names = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'E♭', 'B♭', 'F']
    cx, cy, r = 210, 180, 140
    o = f'<svg viewBox="0 0 420 360" width="420" height="360" xmlns="http://www.w3.org/2000/svg">'
    o += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#e3d8c4" stroke-width="22"/>'
    # tempered fifths: the 1/4-comma meantone pattern, eleven narrow and one wide (wolf)
    for i in range(12):
        a0 = -math.pi / 2 + i * math.pi / 6 + 0.06
        a1 = a0 + math.pi / 6 - 0.12
        col = '#c8102e' if i == 8 else '#1c1a17'
        o += f'<path d="M{cx + r * math.cos(a0):.1f} {cy + r * math.sin(a0):.1f} A{r} {r} 0 0 1 {cx + r * math.cos(a1):.1f} {cy + r * math.sin(a1):.1f}" fill="none" stroke="{col}" stroke-width="{8 if i == 8 else 4}" stroke-linecap="round"/>'
        a = -math.pi / 2 + i * math.pi / 6
        o += f'<circle cx="{cx + r * math.cos(a):.1f}" cy="{cy + r * math.sin(a):.1f}" r="21" fill="#faf7f2" stroke="#1c1a17" stroke-width="1.5"/>'
        o += f'<text x="{cx + r * math.cos(a):.1f}" y="{cy + r * math.sin(a) + 7:.1f}" text-anchor="middle" font-family="G" font-size="21" fill="#1c1a17">{names[i]}</text>'
    o += f'<text x="{cx}" y="{cy - 6}" text-anchor="middle" font-family="G" font-style="italic" font-size="22" fill="#6b645b">eleven fifths</text>'
    o += f'<text x="{cx}" y="{cy + 22}" text-anchor="middle" font-family="G" font-style="italic" font-size="22" fill="#c8102e">and the wolf</text>'
    return o + '</svg>'


with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = b.new_page(viewport={'width': 1200, 'height': 630})
    for name, body in CARDS.items():
        html = BASE.replace('@@BODY@@', body.replace('%(wheel)s', wheel()))
        path = os.path.join(HERE, f'_{name}.html')
        open(path, 'w', encoding='utf-8').write(html)
        pg.goto('file://' + path); pg.wait_for_timeout(500)
        pg.screenshot(path=os.path.join(OUT, f'{name}.jpg'), type='jpeg', quality=88)
    b.close()
print('ok')
