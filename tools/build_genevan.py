"""Extract every Genevan Psalter melody (soprano of the Goudimel 1564 settings in Michael E. Owens's public-domain
edition, genevanpsalter.com) into Cantare tokens."""
import sys, re, json, subprocess
sys.path.insert(0, '/home/claude/repo/site/tools')
from gp_extract import *

PDF = '/home/claude/src/gen/gp.pdf'
d = fitz.open(PDF)


def ptext(i):
    return subprocess.run(['pdftotext', '-f', str(i + 1), '-l', str(i + 1), PDF, '-'], capture_output=True, text=True).stdout


tunes = []
cur = None
for i in range(7, d.page_count):
    t = ptext(i)
    m = re.search(r'Based on (Psalm \d+|Exodus|Luke 2|Luke 1)', t)
    if m:
        if cur: tunes.append(cur)
        cur = {'head': m.group(1), 'systems': [], 'page': i + 1}
    if cur is None: continue
    cur['systems'].extend(soprano3(d[i]))
    f = re.search(r'Music:\s*Genevan Psalter,\s*(\d{4})', t)
    g = re.search(r'\n?([^\n\[]*?)\s*\[GENEVAN\s*([^\]]+)\]', t) or re.search(r'(GENEVAN MAGNIFICAT)', t)
    if f: cur['year'] = f.group(1)
    if g and g.lastindex == 2:
        cur['incipit'] = g.group(1).strip(); cur['tune'] = g.group(2).strip()
    elif g:
        cur['tune'] = 'MAGNIFICAT'; cur['incipit'] = ''
    final = False
    for dr in d[i].get_drawings():
        if (dr.get('width') or 0) > 2:
            for it in dr['items']:
                if it[0] == 'l' and abs(it[1].x - it[2].x) < 0.05 and abs(it[2].y - it[1].y) > 15 and it[1].x > 200: final = True
    if final:
        tunes.append(cur); cur = None
if cur: tunes.append(cur)
print(len(tunes), file=sys.stderr)
json.dump([{k: v for k, v in t.items()} for t in tunes], open('/home/claude/src/gen/tunes_raw.json', 'w'), ensure_ascii=False, default=float)

# ---------- to Cantare ----------
from cantare_emit import pick_clef
SEMI = [0, 2, 4, 5, 7, 9, 11]
lib = json.load(open('/home/claude/repo/site/gym/cantare/data/library.json'))
existing = {}
def walk(n):
    for x in n:
        if x.get('group') == 'Genevan Psalms':
            for it in x['items']:
                if it['title'].startswith('Psalm') and 'genevanpsalter.com' not in it.get('desc', ''): existing[int(re.search(r'Psalm (\d+)', it['title']).group(1))] = it
        walk(x.get('subs', []))
walk(lib if isinstance(lib, list) else lib['library'])

CAPS = {'dieu': 'Dieu', 'seigneur': 'Seigneur', 'éternel': 'Éternel', "l'eternel": "l'Éternel", 'eternel': 'Éternel', 'christ': 'Christ', 'israel': 'Israël', 'sion': 'Sion', 'jacob': 'Jacob', 'david': 'David', 'roy': 'Roy', 'simeon': 'Siméon'}
def sentence(s):
    s = s.replace('’', "'").lower()
    w = s.split(' ')
    w = [CAPS.get(x.strip(',;:.'), x) + (x[len(x.strip(',;:.')):] if CAPS.get(x.strip(',;:.')) else '') for x in w]
    s = ' '.join(w)
    return s[:1].upper() + s[1:]

def midi_of(s, acc, keymap):
    L = s % 7
    a = {'#': 1, 'b': -1, 'n': 0}[acc] if acc else keymap.get(L, 0)
    return (s // 7 + 1) * 12 + SEMI[L] + a

def spell(m, flatkey):
    """diatonic step and alteration for a midi pitch, in a key with no signature or B flat"""
    pc = m % 12; o = m // 12 - 1
    table = {0: (0, 0), 1: (0, 1), 2: (1, 0), 3: (2, -1), 4: (2, 0), 5: (3, 0), 6: (3, 1), 7: (4, 0), 8: (4, 1), 9: (5, 0), 10: (6, -1), 11: (6, 0)}
    L, a = table[pc]
    return o * 7 + L, a

items = []
seen = {}
for t in tunes:
    notes = [n for st in t['systems'] for n in st['notes']]
    if not notes: continue
    keys = sorted(set((s % 7, a) for st in t['systems'] for s, a in st['key']))
    keymap = {L: (1 if a == '#' else -1) for L, a in keys}
    sharps = sum(1 for L, a in keys if a == '#'); flats = sum(1 for L, a in keys if a == 'b')
    if sharps: shift, flatkey = -2, sharps == 1      # the modern edition put these a whole tone up
    elif flats == 2: shift, flatkey = 2, False
    elif flats == 1: shift, flatkey = 0, True
    elif flats == 0: shift, flatkey = 0, False
    else: continue
    # accidentals carry to the same step for the rest of the system (no inner barlines in these settings)
    toks = []; steps = []
    sysacc = {}
    nsys = 0; idx = 0
    flat_list = []
    for st in t['systems']:
        sysacc = {}
        for n in st['notes']:
            if n['acc']: sysacc[n['s']] = n['acc']
            acc = sysacc.get(n['s'])
            m = midi_of(n['s'], acc, keymap) + shift
            s2, a2 = spell(m, flatkey)
            base = -1 if (flatkey and s2 % 7 == 6) else 0
            mark = ''
            if a2 != base:
                mark = {-1: 'b', 0: 'n', 1: '#'}[a2]
                # accidental not in the key: printed by the modern edition, shown as editorial
                if not (a2 == -1 and s2 % 7 == 6 and not flatkey and n['acc'] is None and shift == 2):
                    mark = '^' + mark
            flat_list.append((s2, mark, n['u']))
    # values: quarter = minim, half = semibreve, whole = semibreve and a semibreve rest (phrase end); the last note a longa
    out = []
    for i, (s2, mark, u) in enumerate(flat_list):
        last = i == len(flat_list) - 1
        if last: out.append(f'{s2}{mark}L'); continue
        if u == 4: out.append(f'{s2}{mark}S'); out.append('rS')
        elif u == 3: out.append(f'{s2}{mark}S.')
        elif u == 2: out.append(f'{s2}{mark}S')
        elif u == 1: out.append(f'{s2}{mark}M')
        elif u == 1.5: out.append(f'{s2}{mark}M.')
        else: out.append(f'{s2}{mark}Sm')
        steps.append(s2)
    steps.append(flat_list[-1][0])
    sig = ' '.join(out)
    m = re.match(r'Psalm (\d+)', t['head'])
    num = int(m.group(1)) if m else None
    key = re.sub(r'\^', '', sig)
    if key in seen:
        seen[key]['also'].append(t['head']); continue
    rec = {'num': num, 'head': t['head'], 'year': t.get('year'), 'incipit': t.get('incipit', ''), 'n': sig, 'b': flatkey,
           'steps': steps, 'also': [], 'shift': shift}
    seen[key] = rec
    items.append(rec)

new = []
for r in items:
    if r['num'] in existing: continue
    if r['num']:
        nm = f"Psalm {r['num']}"
    else:
        nm = {'Exodus': 'The Ten Commandments', 'Luke 2': 'Song of Simeon (Nunc dimittis)', 'Luke 1': 'Song of Mary (Magnificat)'}[r['head']]
    inc = sentence(r['incipit']) if r['incipit'] and not r['incipit'].startswith(('LE CANTIQUE', 'GENEVAN')) else ''
    title = f"{nm}, {inc} (Genevan Psalter, {r['year']})" if inc else f"{nm} (Genevan Psalter, {r['year']})"
    also = [a.replace('Psalm ', '') for a in r['also'] if a.startswith('Psalm')]
    desc = f"Genevan Psalter, {r['year']}." + (f" Also the tune of Psalm{'s' if len(also) > 1 else ''} {', '.join(also)}." if also else '')
    desc += ' The melody of the Goudimel settings of 1564, after the public-domain edition of Michael E. Owens (genevanpsalter.com)'
    desc += ', moved back by a whole tone to the pitch of the Genevan print.' if r['shift'] else '.'
    desc += ' Accidentals not in the Genevan print are shown small above the staff.' if '^' in r['n'] else ''
    clef = 'c1' if all(27 <= s <= 37 for s in r['steps']) else pick_clef(r['steps'])
    new.append({'title': title, 'desc': desc, 't': 'C', 'b': r['b'], 'c': clef, 'n': r['n'], '_num': r['num'] or 999})
json.dump(new, open('/home/claude/src/gen/genevan_new.json', 'w'), ensure_ascii=False, indent=0)
print('new', len(new), 'unique tunes', len(items), file=sys.stderr)
