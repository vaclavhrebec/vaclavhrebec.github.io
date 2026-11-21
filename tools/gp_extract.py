"""Pull the four voices out of the Genevan Psalter PDF (genevanpsalter.com, Petrucci glyphs) page by page."""
import pymupdf as fitz, sys, re, json
NOTE = {'˙': 1, 'w': 2, 'W': 4, 'œ': 0.5}   # in minims: half note = minim (original values)

def page_glyphs(p):
    raw = p.get_text('rawdict'); G = []
    for b in raw['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                if 'Petrucci' in s['font']:
                    for ch in s['chars']:
                        G.append((ch['origin'][1], ch['origin'][0], ch['c'], s['size']))
    return G

def staves(p):
    """staff = five horizontal lines 4.5 apart; returns list of (top_y, bottom_y, x0, x1)"""
    ys = {}
    for dr in p.get_drawings():
        for it in dr['items']:
            if it[0] == 'l' and abs(it[1].y - it[2].y) < 0.05 and abs(it[2].x - it[1].x) > 100:
                y = round(it[1].y, 1); ys[y] = (min(it[1].x, it[2].x), max(it[1].x, it[2].x))
    L = sorted(ys); out = []; i = 0
    while i + 4 < len(L):
        if all(abs(L[i + k + 1] - L[i + k] - 4.5) < 0.3 for k in range(4)):
            out.append((L[i], L[i + 4], *ys[L[i]])); i += 5
        else: i += 1
    return out


def staff_lines(p):
    from collections import defaultdict
    ys = defaultdict(float)
    for dr in p.get_drawings():
        for it in dr['items']:
            if it[0] == 'l' and abs(it[1].y - it[2].y) < 0.05:
                ys[round(it[1].y, 1)] += abs(it[2].x - it[1].x)
    L = sorted(y for y, l in ys.items() if l > 200)
    out = []; i = 0
    while i + 4 < len(L):
        if all(abs(L[i + k + 1] - L[i + k] - 4.5) < 0.3 for k in range(4)):
            out.append((L[i], L[i + 4])); i += 5
        else: i += 1
    return out


def voices(p):
    """returns list of systems; each system: list of chords (x, {'S':(step,dur),...}) plus accidentals"""
    G = page_glyphs(p)
    st = staff_lines(p)
    # pair staves into systems (treble then bass), identified by clefs
    clefs = [(y, c) for y, x, c, s in G if c in '&?' and x < 40]
    res = []
    for top, bot in st:
        cl = next((c for y, c in clefs if top - 2 <= y <= bot + 2), None)
        # bottom line step: treble E4 = 30, bass G2 = 18
        bstep = 30 if cl == '&' else 18
        notes = [(x, bstep + round((bot - y) / 2.25), NOTE[c]) for y, x, c, s in G if c in NOTE and top - 20 <= y <= bot + 20]
        accs = [(x, bstep + round((bot - y) / 2.25), c) for y, x, c, s in G if c in '#bn' and top - 20 <= y <= bot + 20]
        dots = [(x, y) for y, x, c, s in G if c == '.' and top - 20 <= y <= bot + 20]
        res.append({'clef': cl, 'top': top, 'bot': bot, 'notes': notes, 'accs': accs, 'dots': dots})
    return res

DUR = {'': 1, '': 1, '˙': 2, 'w': 4}


def barlines(p, top, bot):
    xs = set()
    for dr in p.get_drawings():
        for it in dr['items']:
            if it[0] == 'l' and abs(it[1].x - it[2].x) < 0.05:
                y0, y1 = sorted((it[1].y, it[2].y))
                if y0 <= top + 0.5 and y1 >= bot - 0.5:
                    xs.add(round(it[1].x, 1))
    return sorted(xs)


def soprano(p):
    """top voice of each treble staff, in order: list of (step, minims, acc) ; acc None or -1/0/1 as written; plus key sig"""
    G = page_glyphs(p)
    out = []
    for top, bot in staff_lines(p):
        cl = next((c for y, x, c, s in G if c in '&?' and x < 40 and top - 2 <= y <= bot + 2), None)
        if cl != '&': continue
        win = [(y, x, c, s) for y, x, c, s in G if top - 22 <= y <= bot + 22]
        step = lambda y: 30 + round((bot - y) / 2.25)
        key = [(step(y), c) for y, x, c, s in win if c in '#b' and s > 16.5 and x < 75]
        heads = {}
        for y, x, c, s in win:
            if c in DUR:
                heads.setdefault(round(x), []).append((step(y), DUR[c], x, y))
        flags = [x for y, x, c, s in win if c == 'J']
        dots = [(x, y) for y, x, c, s in win if c == '.']
        accs = [(x, step(y), c) for y, x, c, s in win if c in '#bn' and s < 16.5]
        bars = barlines(p, top, bot)
        notes = []
        # merge heads whose x differ by < 4 (seconds drawn with offset heads)
        xs = sorted(heads)
        groups = []
        for x in xs:
            if groups and x - groups[-1][0] < 4: groups[-1][1].extend(heads[x])
            else: groups.append([x, list(heads[x])])
        for gx, hs in groups:
            st, du, hx, hy = max(hs, key=lambda h: h[0])
            if any(abs(fx - hx) < 12 and fx >= hx - 1 for fx in flags) and du == 1: du = 0.5
            if any(0 < dx - hx < 12 and abs(dy - hy) < 3 for dx, dy in dots): du = du * 1.5
            a = next((c for ax, ast, c in accs if ast == st and 0 < hx - ax < 14), None)
            notes.append({'s': st, 'u': du, 'acc': a, 'x': hx})
        out.append({'top': top, 'key': key, 'notes': notes, 'bars': bars})
    return out


def stems(p):
    S = []
    for dr in p.get_drawings():
        for it in dr['items']:
            if it[0] == 'l' and abs(it[1].x - it[2].x) < 0.05:
                y0, y1 = sorted((it[1].y, it[2].y))
                if 8 < y1 - y0 < 30: S.append((it[1].x, y0, y1))
    return S


def soprano2(p):
    G = page_glyphs(p); ST = stems(p)
    out = []
    for top, bot in staff_lines(p):
        cl = next((c for y, x, c, s in G if c in '&?' and x < 40 and top - 2 <= y <= bot + 2), None)
        if cl != '&': continue
        win = [(y, x, c, s) for y, x, c, s in G if top - 22 <= y <= bot + 22]
        step = lambda y: 30 + round((bot - y) / 2.25)
        key = [(step(y), c) for y, x, c, s in win if c in '#b' and s > 16.5 and x < 75]
        flags = [x for y, x, c, s in win if c == 'J']
        dots = [(x, y) for y, x, c, s in win if c == '.']
        accs = [(x, step(y), c) for y, x, c, s in win if c in '#bn' and s < 16.5]
        sop = []
        heads = [(x, y, c) for y, x, c, s in win if c in DUR]
        for x, y, c in heads:
            if c == 'w':
                # whole: soprano if it is the highest whole note around this x
                rivals = [(xx, yy) for xx, yy, cc in heads if cc == 'w' and abs(xx - x) < 9]
                if y <= min(yy for xx, yy in rivals) + 0.01 and not any(abs(xx - x) < 9 and xx < x - 0.5 and abs(yy - y) < 0.5 for xx, yy in rivals):
                    sop.append((x, y, c))
            else:
                # stem up: a vertical line on the right side of the head (x+4..x+7) whose bottom is near the head
                up = any(x + 3 < sx < x + 8.5 and abs(y1 - (y - 0.5)) < 3 and y0 < y - 6 for sx, y0, y1 in ST)
                if up: sop.append((x, y, c))
        sop.sort()
        # remove duplicates (two heads of a chord on the same stem: keep the highest)
        notes = []
        for x, y, c in sop:
            st = step(y); du = DUR[c]
            if notes and abs(notes[-1]['x'] - x) < 4:
                if st > notes[-1]['s']: notes[-1].update(s=st)
                continue
            if any(abs(fx - x) < 12 and fx >= x - 1 for fx in flags) and du == 1: du = 0.5
            if any(0 < dx - x < 14 and abs(dy - y) < 3 for dx, dy in dots): du = du * 1.5
            a = next((cc for ax, ast, cc in accs if ast == st and 0 < x - ax < 14), None)
            notes.append({'s': st, 'u': du, 'acc': a, 'x': x})
        out.append({'top': top, 'key': key, 'notes': notes})
    return out


def soprano3(p):
    G = page_glyphs(p)
    out = []
    for top, bot in staff_lines(p):
        cl = next((c for y, x, c, s in G if c in '&?' and x < 40 and top - 2 <= y <= bot + 2), None)
        if cl != '&': continue
        win = [(y, x, c, s) for y, x, c, s in G if top - 5 <= y <= bot + 15]
        step = lambda y: 30 + round((bot - y) / 2.25)
        key = [(step(y), c) for y, x, c, s in win if c in '#b' and s > 16.5 and x < 75]
        flags = [x for y, x, c, s in win if c == 'J']
        dots = [(x, y) for y, x, c, s in win if c == '.']
        accs = [(x, step(y), c) for y, x, c, s in win if c in '#bn' and s < 16.5]
        heads = sorted((x, y, c) for y, x, c, s in win if c in DUR)
        cols = []
        for x, y, c in heads:
            if cols and (x - cols[-1][0] < 4 or (c == 'w' and x - cols[-1][0] < 9 and all(cc == 'w' for _, _, cc in cols[-1][1]))):
                if not any(abs(yy - y) < 0.5 for _, yy, _ in cols[-1][1]): cols[-1][1].append((x, y, c))
            else: cols.append([x, [(x, y, c)]])
        def dur(x, y, c):
            du = DUR[c]
            if du == 1 and any(abs(fx - x) < 12 and fx >= x - 1 for fx in flags): du = 0.5
            if any(0 < dx - x < 14 and abs(dy - y) < 3 for dx, dy in dots): du *= 1.5
            return du
        ts = ta = 0.0
        notes = []
        for cx, hs in cols:
            hs.sort(key=lambda h: h[1])      # top first
            t = min(ts, ta)
            if abs(ts - t) < 1e-6:
                x, y, c = hs[0]
                st = step(y); du = dur(x, y, c)
                a = next((cc for ax, ast, cc in accs if ast == st and 0 < x - ax < 14), None)
                notes.append({'s': st, 'u': du, 'acc': a, 'x': x})
                ts += du
                if abs(ta - t) < 1e-6:
                    x2, y2, c2 = hs[-1]
                    ta += dur(x2, y2, c2)
            else:
                x2, y2, c2 = hs[-1]
                ta += dur(x2, y2, c2)
        out.append({'top': top, 'key': key, 'notes': notes})
    return out
