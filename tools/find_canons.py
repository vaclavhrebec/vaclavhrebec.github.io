"""Collect the canons of the Josquin Research Project for Cantare super librum.
Two sources, merged:
  1. the editors' own remarks in the Humdrum files ("Canon at the upper fifth (B-->T, 2 breves)", ...);
  2. strict canons found in the note data: a voice that repeats another note for note (same values) at a fixed
     diatonic interval, for at least MINRUN notes in a row.
Writes OUT/canons.json (a lazy library category, same shape as jrp/c/<code>.json) and OUT/canon-ids.json."""
import glob, json, os, re, sys, html, collections

SRC = '/home/claude/josquin-research-project/jrp-scores'
OUT = sys.argv[1]
MINRUN = 30      # notes in a row
MINFRAC = .25    # and at least this share of the following voice
MIN = {'Mx': 16, 'L': 8, 'B': 4, 'S': 2, 'M': 1, 'Sm': .5, 'F': .25}
TOK = re.compile(r'^(r)?(\d+)?(\^)?([bn#])?(Mx|Sm|L|B|S|M|F)(k)?(\.)?$')
ORD = {0: 'unison', 1: 'second', 2: 'third', 3: 'fourth', 4: 'fifth', 5: 'sixth', 6: 'seventh', 7: 'octave',
       8: 'ninth', 9: 'tenth', 10: 'eleventh', 11: 'twelfth', 14: 'fifteenth'}


def notes(s):
    """[(onset, step, value)] for the sounding notes of one voice, onset in minims"""
    t = 0; prev = 26; out = []
    for tok in s.split():
        m = TOK.match(tok)
        if not m:
            continue
        d = MIN[m.group(5)] * (1.5 if m.group(7) else 1) * (2 / 3 if m.group(6) else 1)
        if m.group(2):
            prev = int(m.group(2))
        if not m.group(1):
            out.append((t, prev, m.group(5) + ('.' if m.group(7) else '')))
        t += d
    return out


def keys(V, n=6):
    """per note: the next n values and melodic steps, so equal keys mean the same tune at any pitch"""
    out = []
    for i in range(len(V) - n + 1):
        out.append(tuple((V[i + k][2], V[i + k + 1][1] - V[i + k][1] if k < n - 1 else 0) for k in range(n)))
    return out


def detect(poly):
    """strict canons: [(leader, follower, interval in steps, delay in breves, notes in a row)]"""
    voices = [notes(v['n']) for v in poly]
    ks = [keys(V) for V in voices]
    found = []
    for bi, B in enumerate(voices):
        for ai, A in enumerate(voices):
            if ai == bi or len(A) < MINRUN or len(B) < MINRUN:
                continue
            idx = collections.defaultdict(list)
            for j, k in enumerate(ks[ai]):
                idx[k].append(j)
            best = None
            i0 = 0
            while i0 < len(ks[bi]):
                run_best = None
                for j in idx.get(ks[bi][i0], []):
                    d = B[i0][1] - A[j][1]
                    k = 0
                    while i0 + k < len(B) and j + k < len(A) and B[i0 + k][2] == A[j + k][2] and B[i0 + k][1] - A[j + k][1] == d:
                        k += 1
                    if k >= MINRUN and B[i0][0] >= A[j][0] - 0.01 and (run_best is None or k > run_best[3]):
                        run_best = (d, (B[i0][0] - A[j][0]) / 4, 0, k)
                if run_best:
                    if best is None or run_best[3] > best[3]:
                        best = run_best
                    i0 += run_best[3]
                else:
                    i0 += 1
            if best and best[3] / len(B) >= MINFRAC:
                found.append((ai, bi, best[0], best[1], best[3]))
    found.sort(key=lambda f: -f[4])
    keep = []
    for f in found:
        if not any({f[0], f[1]} == {g[0], g[1]} for g in keep):
            keep.append(f)
    return keep


def interval_name(d):
    if d == 0:
        return 'unison'
    n = abs(d)
    nm = ORD.get(n, f'{n + 1}th')
    return ('upper ' if d > 0 else 'lower ') + nm


def clean(t):
    t = html.unescape(t).replace('&colon;', ':').replace('&rarr;', '→').replace('-->', '→').replace('->', '→')
    t = re.sub(r'\s+', ' ', t).strip(' .;')
    if t.startswith('[') and t.endswith(']') and t.count('[') == 1:
        t = t[1:-1].strip(' .;')
    return t[:1].upper() + t[1:]


def classes(text):
    """map an editorial remark to a canon type; (kind, label)"""
    low = text.lower()
    out = []
    if 'mensuration' in low:
        out.append(('Mensuration canons', ''))
    if re.search(r'augment|diminut|in duplo|decrescit|fourfold|threefold aug|2:1', low):
        out.append(('Canons by augmentation or diminution', ''))
    if 'inversion' in low or 'contrary' in low:
        out.append(('Canons by inversion', ''))
    num = {'unison': 0, 'second': 1, '2nd': 1, 'third': 2, '3rd': 2, 'fourth': 3, '4th': 3, 'fifth': 4, '5th': 4,
           'sixth': 5, '6th': 5, 'seventh': 6, '7th': 6, 'octave': 7, '8ve': 7, 'ninth': 8, '9th': 8, 'fifteenth': 14, '15th': 14,
           'twelfth': 11, '12th': 11}
    for m in re.finditer(r'(?:at|in)(?: the)?\s+(upper|lower)?\s*(unison|second|2nd|third|3rd|fourth|4th|fifth|5th|sixth|6th|seventh|7th|octave|8ve|ninth|9th|twelfth|12th|fifteenth|15th)\b', low):
        k = num[m.group(2)]
        if k and not m.group(1):
            continue            # no direction given: leave the interval out
        d = (k if m.group(1) != 'lower' else -k)
        if k == 0:
            d = 0
        out.append(('Canons at the ' + interval_name(d), (k, d)))
    if 'unison' in low and not any(c[0].endswith('unison') for c in out):
        out.append(('Canons at the unison', (0, 0)))
    return out


def jid(f):
    return os.path.basename(f).split('-')[0]


# 1. editorial remarks
remarks = collections.defaultdict(list)
for f in glob.glob(SRC + '/*/*.krn'):
    seen = set()
    for line in open(f, encoding='utf-8', errors='replace'):
        for m in re.finditer(r't=([^\t]*)', line):
            t = m.group(1)
            if re.search(r'\bcanon', t, re.I) and not re.search(r'canonic(?!al)', t, re.I) or 'canon' in t.lower():
                c = clean(t)
                if c and c not in seen:
                    seen.add(c); remarks[jid(f)].append(c)

# 2. detection in the converted pieces
detected = {}
for f in glob.glob(OUT + '/p/*.json'):
    p = json.load(open(f, encoding='utf-8'))
    names = [v.get('nm') or f'voice {i + 1}' for i, v in enumerate(p['poly'])]
    res = detect(p['poly'])
    if res:
        detected[os.path.basename(f)[:-5]] = [(names[a], names[b], d, dl, k) for a, b, d, dl, k in res]

# 3. stubs of every piece (title, preview), from the composer files
stubs = {}
def walk(subs, comp):
    for g in subs:
        for it in g.get('items', []):
            stubs[it['jrp']] = (it, comp)
        walk(g.get('subs', []), comp)
for f in glob.glob(OUT + '/c/*.json'):
    d = json.load(open(f, encoding='utf-8'))
    walk(d['subs'], d['code'])

groups = collections.OrderedDict()
def add(label, jid_, line):
    if jid_ not in stubs:
        return
    g = groups.setdefault(label, {})
    g.setdefault(jid_, []).append(line)

for j, rs in remarks.items():
    for r in rs:
        cl = classes(r)
        if not cl:
            cl = [('Riddle canons and other canons', '')]
        for label, _ in cl:
            add(label, j, 'Editor’s note: ' + r + ('' if r.endswith(('.', ']', ')')) else '.'))
for j, ds in detected.items():
    for a, b, d, dl, k in ds:
        delay = '' if dl <= 0 else (f', {round(dl * 2) / 2:g} breve{"s" if round(dl * 2) / 2 != 1 else ""} later' if dl < 20 else '')
        add('Canons at the ' + interval_name(d), j, f'Found in the notes: {b} follows {a} at the {interval_name(d)}{delay}, {k} notes in a row.')

ORDER = ['unison', 'upper second', 'lower second', 'upper third', 'lower third', 'upper fourth', 'lower fourth', 'upper fifth', 'lower fifth',
         'upper sixth', 'lower sixth', 'upper seventh', 'lower seventh', 'upper octave', 'lower octave', 'upper ninth', 'lower ninth']
def okey(label):
    m = re.match(r'Canons at the (.*)', label)
    if m:
        try:
            return (0, ORDER.index(m.group(1)))
        except ValueError:
            return (0, 99)
    return (1, label)

subs = []
total = 0
for label in sorted(groups, key=okey):
    items = []
    for j, lines in sorted(groups[label].items(), key=lambda kv: (stubs[kv[0]][1] == 'Ano', kv[0])):
        it, comp = stubs[j]
        uniq = []
        for l in lines:
            if l not in uniq:
                uniq.append(l)
        extra = ' '.join(uniq[:4])
        it2 = dict(it)
        it2['desc'] = (extra + ' ' + it['desc']).strip()
        items.append(it2)
    total += len(items)
    n = len(items)
    subs.append({'group': label, 'note': f'{n} piece{"" if n == 1 else "s"}.', 'items': items})
canons = {'subs': subs}
with open(OUT + '/canons.json', 'w', encoding='utf-8') as fh:
    json.dump(canons, fh, ensure_ascii=False, separators=(',', ':'))
ids = sorted({it['jrp'] for g in subs for it in g['items']})
print('pieces with a canon', len(ids), 'entries', total, 'remarks', len(remarks), 'detected', len(detected))
for g in subs:
    print(' ', g['group'], len(g['items']))
