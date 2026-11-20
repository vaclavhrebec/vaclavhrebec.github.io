"""Convert a JRP Humdrum **kern file into a Cantare super librum library item (poly form)."""
import re, sys, json
from fractions import Fraction as Fr

LET = 'cdefgab'
# drawable values in minims: plain, dotted, black (2/3)
VALS = {'Mx': Fr(16), 'L': Fr(8), 'B': Fr(4), 'S': Fr(2), 'M': Fr(1), 'Sm': Fr(1, 2), 'F': Fr(1, 4)}
TABLE = []
for d, m in VALS.items():
    TABLE.append((m, d, '', ''))
    TABLE.append((m * Fr(3, 2), d, '.', ''))
for d, m in VALS.items():
    if d in ('Mx', 'L', 'B', 'S', 'M'):
        TABLE.append((m * Fr(2, 3), d, '', 'k'))
LOOK = {}
for m, d, dot, k in TABLE:
    LOOK.setdefault(m, (d, dot, k))
ORDER = sorted([x for x in TABLE if not x[3]], key=lambda x: -x[0])


def split_dur(m, rest=False, okdot=()):
    """a value no single sign can show: as a chain of tied plain values, largest first"""
    if m in LOOK and m <= 8 and not (rest and LOOK[m][1] and LOOK[m][0] not in okdot):
        return [LOOK[m]]
    out = []
    left = m
    while left > 0:
        for mm, d, dot, k in ORDER:
            if mm <= left and mm <= 8 and not (rest and dot and d not in okdot):
                out.append((d, dot, k)); left -= mm; break
        else:
            # below a fusa: drop it
            break
    return out


def recip_minims(tok):
    m = re.search(r'(\d+)(?:%(\d+))?(\.*)', tok)
    if not m:
        return None
    a = m.group(1)
    if re.fullmatch(r'0+', a):
        whole = Fr(2 ** len(a))
    else:
        whole = Fr(1, int(a))
    if m.group(2):
        whole = Fr(int(m.group(2)), int(a)) if a != '0' else whole * int(m.group(2))
    base = whole
    dots = len(m.group(3))
    tot = base
    for i in range(dots):
        tot += base / (2 ** (i + 1))
    return tot * 2


def pitch(tok):
    m = re.search(r'([a-gA-G])\1*', tok)
    if not m:
        return None
    s = m.group(0)
    L = LET.index(s[0].lower())
    if s[0].islower():
        octv = 3 + len(s)
    else:
        octv = 4 - len(s)
    rest = tok[m.end():]
    acc = 0
    am = re.match(r'(#+|-+|n)?', rest)
    a = am.group(0) if am else ''
    if a.startswith('#'):
        acc = len(a)
    elif a.startswith('-'):
        acc = -len(a)
    after = rest[len(a):]
    hidden = after.startswith('y')
    edit = bool(re.match(r'y?[ij]', after)) or ('i' in after[:3] and not hidden) or ('j' in after[:3])
    return octv * 7 + L, acc, ('n' in a), edit


def parse(path):
    lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
    meta = {}
    for ln in lines:
        m = re.match(r'^!!!([^:]+):\s*(.*)$', ln)
        if m and m.group(1) not in meta:
            meta[m.group(1)] = m.group(2).strip()
    # spines
    spines = None      # list of dicts: type, id (kern index), sub
    secs = {}          # label -> list of events per kern voice
    order = []
    cur = None
    exp = None
    voices = []        # per kern spine: info
    kern_ids = []
    nexts = 0
    data = []          # (label, line tokens with spine ids)
    for ln in lines:
        if not ln or ln.startswith('!'):
            # '!!' global and '!' local comments (e.g. "!LO:TX:...t=[Canon at the lower fifth]")
            # are not music; a local comment read as data became a stray fusa (Jos1201e.a)
            continue
        toks = ln.split('\t')
        if spines is None:
            if ln.startswith('**'):
                spines = []
                for t in toks:
                    sid = nexts; nexts += 1
                    spines.append({'type': t, 'id': sid})
                continue
            continue
        if len(toks) != len(spines):
            # malformed line: skip
            continue
        if ln.startswith('*'):
            # labels
            if toks[0].startswith('*>'):
                v = toks[0][2:]
                if v.startswith('['):
                    if exp is None:
                        exp = v.strip('[]').split(',')
                elif '[' not in v and not v.startswith('norep') and re.match(r'^[^\[\]]+$', v):
                    cur = v
                    if cur not in order:
                        order.append(cur)
                    secs.setdefault(cur, [])
                continue
            # spine manipulators
            if any(t in ('*^', '*v', '*-', '*+', '*x') for t in toks):
                new = []
                i = 0
                while i < len(toks):
                    t = toks[i]; sp = spines[i]
                    if t == '*^':
                        new.append(dict(sp, sub=sp.get('sub', 0)))
                        new.append(dict(sp, sub=sp.get('sub', 0) + 1))
                        i += 1
                    elif t == '*v':
                        j = i
                        while j < len(toks) and toks[j] == '*v' and spines[j]['id'] == sp['id']:
                            j += 1
                        new.append(dict(sp, sub=min(spines[k].get('sub', 0) for k in range(i, j))))
                        i = j if j > i else i + 1
                    elif t == '*-':
                        i += 1
                    else:
                        new.append(sp); i += 1
                spines = new
                continue
            if cur is None:
                cur = '_'; order.append(cur); secs[cur] = []
            secs[cur].append(('*', [(sp, t) for sp, t in zip(spines, toks)]))
            continue
        if ln.startswith('='):
            continue
        if cur is None:
            cur = '_'; order.append(cur); secs[cur] = []
        secs[cur].append(('d', [(sp, t) for sp, t in zip(spines, toks)]))
    seq = [s for s in (exp or order) if s in secs]
    if not seq:
        seq = order
    if '_' in secs and '_' not in seq:
        seq = ['_'] + seq
    return meta, secs, seq


def convert(path):
    meta, secs, seq = parse(path)
    # identify kern spines and their text spine (the one right after it, until the next kern)
    kids = []
    first = None
    for lab in seq:
        for kind, row in secs[lab]:
            first = row; break
        if first: break
    allrows = [r for lab in seq for r in secs[lab]]
    # kern spine ids in order of appearance
    seen = []
    for kind, row in allrows:
        for sp, t in row:
            if sp['type'] == '**kern' and sp['id'] not in seen:
                seen.append(sp['id'])
    # map text spines to preceding kern spine
    txt_of = {}
    for kind, row in allrows:
        last = None
        for sp, t in row:
            if sp['type'] == '**kern':
                last = sp['id']
            elif sp['type'] in ('**text', '**silbe') and last is not None:
                txt_of.setdefault(sp['id'], last)
        break
    V = {k: {'ev': [], 'clef': None, 'key': None, 'name': None, 'met': None, 'textline': None} for k in seen}
    # walk rows; for each kern spine only the first sub-spine
    pending_txt = {}
    time = Fr(0)
    # every voice notes where a section begins and where its mensuration changes (sign and bar), by the index of its
    # next event: the app beats the tactus afresh from each, with the minim kept constant
    for v in V.values(): v['mchg'] = []
    marked = []
    for lab in seq:
        marked.append(('S', lab))
        marked.extend(secs[lab])
    for kind, row in marked:
        if kind == 'S':
            for v in V.values(): v['mchg'].append((len(v['ev']), 'sec', row))
            continue
        if kind == '*':
            for sp, t in row:
                if sp['type'] != '**kern' or sp.get('sub', 0): continue
                if t.startswith('*met('): V[sp['id']]['mchg'].append((len(V[sp['id']]['ev']), 'met', t[5:-1]))
                elif re.fullmatch(r'\*M\d+/\d+', t): V[sp['id']]['mchg'].append((len(V[sp['id']]['ev']), 'M', t[2:]))
            for sp, t in row:
                if sp['type'] != '**kern' or sp.get('sub', 0): continue
                v = V[sp['id']]
                if t.startswith('*clef') and v['clef'] is None: v['clef'] = t[5:]
                elif t.startswith('*k[') and v['key'] is None: v['key'] = t[3:-1]
                elif t.startswith('*I"') and v['name'] is None: v['name'] = t[3:]
                elif t.startswith('*met(') and v['met'] is None: v['met'] = t[5:-1]
            continue
        # data row
        texts = {}
        for sp, t in row:
            if sp['type'] in ('**text', '**silbe') and t != '.':
                k = txt_of.get(sp['id'])
                if k is not None and k not in texts: texts[k] = t
        ends = [sp for sp, t in row if sp['type'] == '**kern' and not sp.get('sub', 0) and t != '.' and re.search(r'[a-gA-G]', t) and 'l' in re.sub(r'[^a-zA-Z]', '', t.split(' ')[0])[1:]]
        kcount = [sp for sp, t in row if sp['type'] == '**kern' and not sp.get('sub', 0)]
        all_long = len(ends) == len(kcount) and len(ends) > 0
        for sp, t in row:
            if sp['type'] != '**kern' or sp.get('sub', 0) or t == '.': continue
            tok = t.split(' ')[0]
            if 'q' in tok: continue
            dur = recip_minims(re.sub(r'^[\[\(&{<>]*', '', tok))
            if dur is None: continue
            v = V[sp['id']]
            if 'r' in tok:
                v['ev'].append({'r': True, 'u': dur})
                continue
            p = pitch(tok)
            if p is None: continue
            s, acc, nat, edit = p
            tie_end = ']' in tok or '_' in tok
            tie_start = '[' in tok
            long_ = all_long and 'l' in re.sub(r'[^a-zA-Z]', '', tok)[1:]
            e = {'r': False, 'u': dur, 's': s, 'acc': acc, 'nat': nat, 'edit': edit, 'long': long_}
            if tie_end and v['ev'] and not v['ev'][-1]['r'] and v['ev'][-1].get('open') and v['ev'][-1]['s'] == s:
                prev = v['ev'][-1]
                prev['u'] += dur
                prev['open'] = tie_start or ('_' in tok)
                prev['long'] = prev['long'] or long_
                continue
            e['open'] = tie_start
            txt = texts.get(sp['id'])
            if txt and txt not in ('.',):
                e['txt'] = txt
            v['ev'].append(e)
    return meta, seq, V


KEYFLATS = lambda key: set(re.findall(r'([a-g])-', key or ''))
KEYSHARPS = lambda key: set(re.findall(r'([a-g])#', key or ''))

CLEFS = {'c1': 28, 'c2': 26, 'c3': 24, 'c4': 22, 'c5': 20, 'bass': 18}


def pick_clef(steps):
    if not steps: return 'c4'
    best = None
    for k, bottom in CLEFS.items():
        cost = 0
        for s in steps:
            pos = s - bottom
            if pos < -1: cost += (-1 - pos)
            elif pos > 9: cost += (pos - 9)
        steps_sorted = sorted(steps)
        med = steps_sorted[len(steps_sorted) // 2]
        cost = cost * 10 + abs(med - (bottom + 4)) * 0.01
        if best is None or cost < best[0]: best = (cost, k)
    return best[1]


def fmt_sy(t):
    t = t.strip()
    if t.startswith('-'): t = t[1:]
    t = t.replace(' ', '_').replace('|', '')
    t = re.sub(r'\s+', '_', t)
    if not t or t == '-': return '.'
    return t


def build(path):
    meta, seq, V = convert(path)
    ids = list(V.keys())[::-1]           # top voice first
    ids = [k for k in ids if any(not e['r'] for e in V[k]['ev'])]
    # global B-flat: majority of voices
    flats = [('b' in KEYFLATS(V[k]['key'])) for k in ids]
    gb = sum(flats) * 2 > len(flats)
    met = next((V[k]['met'] for k in ids if V[k]['met']), '') or ''
    perfect = met.startswith('O')
    poly = []
    total = []
    for k in ids:
        v = V[k]
        kf = KEYFLATS(v['key']); ks = KEYSHARPS(v['key'])
        toks = []; lyr = []
        steps = [e['s'] for e in v['ev'] if not e['r']]
        has_txt = any(e.get('txt') for e in v['ev'])
        t_sum = Fr(0)
        for e in v['ev']:
            t_sum += e['u']
            if e['r']:
                for d, dot, kk in split_dur(e['u'], rest=True, okdot=('B',) if perfect else ()):
                    toks.append('r' + d + kk + dot)
                continue
            s = e['s']; L = 'cdefgab'[s % 7]
            base = -1 if (gb and L == 'b') else 0     # what the global signature gives
            want = e['acc']
            a = ''
            if want != base:
                a = {-1: 'b', 0: 'n', 1: '#'}.get(want, '#' if want > 0 else 'b')
                own_sig = (L in kf and want == -1) or (L in ks and want == 1)
                if e['edit'] and not own_sig:
                    a = '^' + a
            parts = [('L', '', '')] if e['long'] else split_dur(e['u'])
            for j, (d, dot, kk) in enumerate(parts):
                toks.append(f"{s}{a if j == 0 else ''}{d}{kk}{dot}")
                if has_txt:
                    lyr.append(e['txt'] if (j == 0 and e.get('txt')) else None)
        if e is not None and e.get('long'):
            pass
        clef = pick_clef(steps)
        pv = {'c': clef, 'n': ' '.join(toks)}
        if has_txt:
            raw = [x for x in lyr if x is not None]
            outl = []; ri = 0
            for x in lyr:
                if x is None: outl.append('.'); continue
                ri += 1
                sy = fmt_sy(x)
                nxt = raw[ri] if ri < len(raw) else ''
                if sy != '.' and not sy.endswith('-') and nxt.strip().startswith('-') and not x.strip().endswith('-'):
                    sy += '-'
                outl.append(sy)
            while outl and outl[-1] == '.': outl.pop()
            pv['lyr'] = ' '.join(outl)
        if v['name']: pv['nm'] = re.sub(r'([A-Za-z])(\d+)$', r'\1 \2', v['name'].strip())
        poly.append(pv)
    met = next((V[k]['met'] for k in ids if V[k]['met']), '') or ''
    t = 'O' if met.startswith('O') else 'C'
    cut = '|' in met
    item = {'t': t, 'cut': cut, 'b': gb, 'poly': poly}
    grid, signs = mensurations(V, ids)
    if grid: item['ms'] = grid
    for k, pv in zip(ids, poly):
        if signs.get(k): pv['ms'] = signs[k]
    return meta, item


def bar_of(sig):
    """a time signature of the edition (*M3/1) as [minims in the bar, parts of the tactus]"""
    a, b = sig.split('/')
    one = recip_minims(b)
    if not one or not int(a): return None
    n = int(a)
    bar = n * one
    return [int(bar) if bar == int(bar) else float(bar), 3 if n in (3, 9) else 2]


def mensurations(V, ids):
    """The tactus grid and the signs. Returns (grid, signs): grid = [[time in minims, minims in the bar, parts], ...], from the
    top voice's sections and time signatures, one entry wherever a section begins or the bar changes; signs = for each voice
    [[time, sign], ...] wherever its mensuration sign is set. Times count the values as written out here (a section's final
    long as a full long). Proportions (3, C|3, O/3 ...), and an O that the edition bars in 2/1, are written out as triplets
    inside the usual bar: where every singing voice has such a sign, the bar beats in three."""
    def at_of(k):
        at = [Fr(0)]
        for e in V[k]['ev']:
            at.append(at[-1] + (8 if e.get('long') else e['u']))
        return at
    num = lambda t: int(t) if t == int(t) else float(t)
    signs = {}
    for k in ids:
        at = at_of(k); out = []
        for idx, kind, val in V[k]['mchg']:
            if kind != 'met': continue
            t = at[min(idx, len(at) - 1)]
            if t >= at[-1] and out: continue
            if out and out[-1][0] == num(t): out[-1][1] = val
            elif not out or out[-1][1] != val or True: out.append([num(t), val])
        signs[k] = out
    def sign_at(k, t):
        cur = ''
        for tt, sg in signs[k]:
            if tt <= t + 1e-9: cur = sg
        return cur
    ats = {k: at_of(k) for k in ids}
    def sounds(k, t0, t1):
        a = ats[k]
        return any(not e['r'] and a[i] < t1 and a[i + 1] > t0 for i, e in enumerate(V[k]['ev']))
    top = ids[0]
    at = at_of(top)
    grid = []
    M = None
    bykey = {}
    for idx, kind, val in V[top]['mchg']:
        bykey.setdefault(idx, []).append((kind, val))
    for idx in sorted(bykey):
        for kind, val in bykey[idx]:
            if kind == 'M': M = val
        t = at[min(idx, len(at) - 1)]
        if t >= at[-1]: continue
        b = bar_of(M) if M else None
        bar0 = (bar_of(M) or [4])[0] if M else 4
        sg = [sign_at(k, num(t)) for k in ids if sounds(k, t, t + bar0)]
        sg = [x for x in sg if x]
        if b is None:
            b = [6, 3] if sg and all(x.startswith('O') for x in sg) else [4, 2]
        if b[1] == 2 and int(M.split('/')[0] if M else 2) == 2 and sg and all('3' in x or x.startswith('O') for x in sg):
            b = [b[0], 3]
        e = [num(t), b[0], b[1]]
        if grid and grid[-1][0] == e[0]: grid[-1] = e
        else: grid.append(e)
    if grid and grid[0][0] != 0: grid.insert(0, [0, grid[0][1], grid[0][2]])
    return grid, signs


if __name__ == '__main__':
    meta, item = build(sys.argv[1])
    print(json.dumps(item, ensure_ascii=False)[:3000])
