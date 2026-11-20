"""Shared output stage for the non-JRP converters (MEI, MusicXML): from per-voice event lists to a Cantare 'poly' item.

An event is a dict: r (rest?), u (length in minims, Fraction), s (diatonic step, C4 = 28), acc (-1/0/+1, sounding),
edit (accidental is editorial), txt (syllable, '-' at its end if the word goes on), long (a final long).
Values are written at their full length (a perfect brevis as B.), like the Josquin collection, so the item carries
'jrp' (its id) and the app reads it without lengthening breves a second time in tempus perfectum."""
import re
from fractions import Fraction as Fr

VALS = [('Mx', Fr(16)), ('L', Fr(8)), ('B', Fr(4)), ('S', Fr(2)), ('M', Fr(1)), ('Sm', Fr(1, 2)), ('F', Fr(1, 4))]
LOOK = {}
for d, m in VALS:
    LOOK.setdefault(m, (d, '', ''))
for d, m in VALS:
    LOOK.setdefault(m * Fr(3, 2), (d, '.', ''))
for d, m in VALS:
    if d in ('Mx', 'L', 'B', 'S', 'M'):
        LOOK.setdefault(m * Fr(2, 3), (d, '', 'k'))     # coloured: the triplet groups
PLAIN = sorted([(m, d) for d, m in VALS], key=lambda x: -x[0])


def split_dur(m, cap, rest=False):
    """one sign where one sign can show it, else tied plain values, largest first; rests never dotted below the brevis"""
    if m in LOOK and m <= cap:
        d, dot, k = LOOK[m]
        if not (rest and dot and d not in ('B', 'L')):
            return [LOOK[m]]
    out, left = [], m
    while left > 0:
        for mm, d in PLAIN:
            if mm <= left and mm <= cap:
                out.append((d, '', '')); left -= mm; break
        else:
            break          # smaller than a fusa: dropped
    return out


# clefs by the step of their lowest line; C and F clefs first, G clefs only where nothing else holds the voice
CLEF_BOTTOM = [('c1', 28), ('c2', 26), ('c3', 24), ('c4', 22), ('c5', 20), ('bass', 18), ('f5', 16), ('treble', 30), ('g1', 32)]


def ledgers(steps, bottom):
    n = 0
    for s in steps:
        p = s - bottom
        if p < -1: n += (-p) // 2
        elif p > 9: n += (p - 8) // 2
    return n


def pick_clef(steps):
    """the clef that keeps the whole voice on the five lines (no ledger lines), the C clefs preferred, then the one
    that centres the voice best; if no clef manages it, the one needing fewest ledger lines"""
    if not steps: return 'c4'
    st = sorted(steps)
    med = st[len(st) // 2]
    best = None
    for i, (k, b) in enumerate(CLEF_BOTTOM):
        g = 1 if k in ('treble', 'g1') else 0
        cost = (ledgers(steps, b), g, abs(med - (b + 4)), i)
        if best is None or cost < best[0]: best = (cost, k)
    return best[1]


def fmt_sy(t):
    t = re.sub(r'\s+', '_', t.strip()).replace('|', '')
    return t or '.'


def emit(voices, gb, perfect, cap=8):
    """voices: list of dict(name, ev). Returns poly list. gb: B-flat in the global signature."""
    poly = []
    for v in voices:
        toks, lyr = [], []
        has_txt = any(e.get('txt') for e in v['ev'])
        kf = v.get('sigflat', set())
        for e in v['ev']:
            if e['r']:
                for d, dot, kk in split_dur(e['u'], cap, rest=True):
                    toks.append('r' + d + kk + dot)
                continue
            s = e['s']; L = 'cdefgab'[s % 7]
            base = -1 if (gb and L == 'b') else 0
            want = e['acc']; a = ''
            if want != base:
                a = {-1: 'b', 0: 'n', 1: '#'}.get(want, '#' if want > 0 else 'b')
                own = (L in kf and want == -1)
                if e.get('edit') and not own:
                    a = '^' + a
            parts = [('L', '', '')] if e.get('long') and e['u'] >= 8 else split_dur(e['u'], cap)
            for j, (d, dot, kk) in enumerate(parts):
                toks.append(f"{s}{a if j == 0 else ''}{d}{kk}{dot}{'~' if j else ''}")
                if has_txt:
                    lyr.append(e.get('txt') if j == 0 else None)
        steps = [e['s'] for e in v['ev'] if not e['r']]
        pv = {'c': pick_clef(steps), 'n': ' '.join(toks)}
        if has_txt:
            out = ['.' if x is None else fmt_sy(x) for x in lyr]
            while out and out[-1] == '.': out.pop()
            pv['lyr'] = ' '.join(out)
        if v.get('name'): pv['nm'] = v['name']
        poly.append(pv)
    return poly


def trim_rests(voices):
    """a voice that is silent to the end keeps its rests; nothing else is changed"""
    return voices
