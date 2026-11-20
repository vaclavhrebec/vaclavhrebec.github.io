"""Add further polyphony to the Cantare library, beside the Josquin Research Project:
  - The 1520s Project (Benjamin Ory; Humdrum, same conventions as the JRP; CC BY-NC 4.0)
  - CRIM, Citations: The Renaissance Imitation Mass (MEI; CC BY-NC 4.0)
Writes into OUT (the app's jrp/ folder): p/<id>.json, c/<code>.json, and merges index.json and search.json.
Run after build_all.py (which rebuilds the JRP part from scratch)."""
import glob, json, os, re, sys, html, csv
from fractions import Fraction as Fr
sys.path.insert(0, os.path.dirname(__file__))
from kern2cantare import build as kbuild
from mei2cantare import read as mread
from cantare_emit import emit, pick_clef

OUT = sys.argv[1]
SRC1520 = '/home/claude/src/1520s-project-scores/humdrum'
SRCCRIM = '/home/claude/src/crim_mei'

# composer code -> (full name, short name for titles); codes of the 1520s Project where it has one
C = {
    'Arc': ('Jacques Arcadelt', 'Arcadelt'), 'Bau': ('Noel Bauldeweyn', 'Bauldeweyn'), 'Con': ('Jean Conseil', 'Conseil'),
    'Crp': ('Carpentras (Elzéar Genet)', 'Carpentras'), 'Div': ('Antonius Divitis', 'Divitis'), 'Fsc': ('Costanzo Festa', 'C. Festa'),
    'Fss': ('Sebastiano Festa', 'S. Festa'), 'Gom': ('Nicolas Gombert', 'Gombert'), 'Gsc': ('Mathieu Gascongne', 'Gascongne'),
    'Jac': ('Jacotin', 'Jacotin'), 'Jan': ('Maistre Jan', 'Maistre Jan'), 'Jom': ('Jachet of Mantua', 'Jachet'),
    'Lfg': ('Jean de la Fage', 'La Fage'), 'Lhe': ('Jean Lhéritier', 'Lhéritier'), 'Lpi': ('Johannes Lupi', 'Lupi'),
    'Lps': ('Lupus Hellinck', 'Hellinck'), 'Mlu': ('Pierre Moulu', 'Moulu'), 'Ren': ('Renaldo', 'Renaldo'),
    'Ric': ('Jean Richafort', 'Richafort'), 'Ror': ('Cipriano de Rore', 'Rore'), 'Ser': ('Claudin de Sermisy', 'Sermisy'),
    'Sil': ('Andreas de Silva', 'de Silva'), 'Snf': ('Ludwig Senfl', 'Senfl'), 'Ver': ('Philippe Verdelot', 'Verdelot'),
    'Vin': ('Jheronimus Vinders', 'Vinders'), 'Wil': ('Adrian Willaert', 'Willaert'),
    'Bar': ('Hotinet Barra', 'Barra'), 'Opi': ('Benedictus de Opitiis', 'de Opitiis'), 'The': ('Pierrequin de Therache', 'Therache'),
    'Cha': ('Nicolas Champion', 'Champion'), 'Era': ('Erasmus Lapicida', 'Lapicida'), 'Bnt': ('Johannes Brunet', 'Brunet'),
    'Boy': ('Boyleau', 'Boyleau'), 'Bis': ('Bisgueria', 'Bisgueria'), 'Res': ('Nicole Regnes', 'Regnes'), 'Lsa': ('Le Santier', 'Le Santier'),
    # already in the Josquin collection: further pieces are added to their groups
    'Mou': ('Jean Mouton', 'Mouton'), 'Fva': ('Antoine de Févin', 'Févin'),
    # from CRIM
    'Pal': ('Giovanni Pierluigi da Palestrina', 'Palestrina'), 'Las': ('Orlande de Lassus', 'Lassus'),
    'Mor': ('Cristóbal de Morales', 'Morales'), 'Gue': ('Francisco Guerrero', 'Guerrero'), 'Vic': ('Tomás Luis de Victoria', 'Victoria'),
    'Pad': ('Annibale Padovano', 'Padovano'), 'Hes': ('Nicolle des Celliers de Hesdin', 'Hesdin'), 'Man': ('Pierre de Manchicourt', 'Manchicourt'),
    'Pie': ('Loyset Piéton', 'Piéton'), 'Col': ('Pierre Colin', 'Colin'), 'Soh': ('Mathieu Sohier', 'Sohier'), 'Mrl': ('Nicolas de Marle', 'de Marle'),
    'Cle': ('Pierre Clereau', 'Clereau'), 'Guy': ('Jean Guyon', 'Guyon'), 'Dau': ('Pierre Daulphin', 'Daulphin'), 'Phi': ('Dominique Phinot', 'Phinot'),
    'For': ('Mathurin Forestier', 'Forestier'), 'Bac': ('Ippolito Baccusi', 'Baccusi'), 'Her': ('Jean Hérissant', 'Hérissant'),
    'Riq': ('Pere Riquet', 'Riquet'), 'Lec': ('Leonhard Lechner', 'Lechner'), 'Mer': ('Claudio Merulo', 'Merulo'), 'San': ('Pierre Sandrin', 'Sandrin'),
    'Tch': ('Thomas Champion', 'T. Champion'), 'Cad': ('Pierre Cadéac', 'Cadéac'), 'Pas': ('Pierre Passereau', 'Passereau'),
    'Dlu': ('Didier Lupi Second', 'D. Lupi'), 'Leh': ('Guillaume Le Heurteur', 'Le Heurteur'), 'Cou': ('Jean Courtois', 'Courtois'),
    'Pri': ('Giovan Leonardo Primavera', 'Primavera'), 'Fer': ('Domenico Ferrabosco', 'Ferrabosco'), 'Clm': ('Jacobus Clemens non Papa', 'Clemens'),
}
CRIMNAME = {
    'Giovanni Pierluigi da Palestrina': 'Pal', 'Roland de Lassus': 'Las', 'Claudin de Sermisy': 'Ser', 'Francisco Guerrero': 'Gue',
    'Padovano, Annibale': 'Pad', 'Nicolle des Celliers de Hesdin': 'Hes', 'Cipriano de Rore': 'Ror', 'Pierre de Manchicourt': 'Man',
    'Loyset Piéton': 'Pie', 'Nicolas Gombert': 'Gom', 'Cristóbal de Morales': 'Mor', 'Victoria, Tomás Luis de': 'Vic', 'Pierre Colin': 'Col',
    'Mathieu Sohier': 'Soh', 'Nicolas De Marle': 'Mrl', 'Pierre Clereau': 'Cle', 'Jean Guyon': 'Guy', 'Pierre Daulphin': 'Dau',
    'Dominique Phinot': 'Phi', 'Adrian Willaert': 'Wil', 'Mathurin Forestier': 'For', 'Ippolito Baccusi': 'Bac', 'Jean Hérissant': 'Her',
    'Pere Riquet': 'Riq', 'Leonhard Lechner': 'Lec', 'Claudio Merulo': 'Mer', 'Pierre Sandrin': 'San', 'Verdelot, Philippe': 'Ver',
    'Johannes Lupi': 'Lpi', 'Thomas Champion': 'Tch', 'Pierre Cadéac': 'Cad', 'Pierre Passereau': 'Pas', 'Didier Lupi': 'Dlu',
    'Le Heurteur, Guillaume': 'Leh', 'Lupus Hellinck': 'Lps', 'Courtois, Jean': 'Cou', 'Richafort, Johannes': 'Ric', 'Mantua, Jachet de': 'Jom',
    'Giovan Leonardo Primavera': 'Pri', 'Domenico Ferrabosco': 'Fer', 'Jean Lhéritier': 'Lhe', 'Jacob Clemens non Papa': 'Clm',
    'Antoine de Févin': 'Fva', 'Jean Mouton': 'Mou',
}
SKIP1520 = {'Any'}     # the anonymous pieces stay out (the JRP has its own anonymous group)
MOVE = ['Kyrie', 'Gloria', 'Et in terra', 'Credo', 'Patrem', 'Sanctus', 'Agnus']
LIC = 'CC BY-NC 4.0'


def u(x): return html.unescape(x or '').strip()


def norm(t): return re.sub(r'[^a-z]', '', (t or '').lower().replace('æ', 'ae').replace('j', 'i').replace('v', 'u').replace('y', 'i'))


def reclef(poly):
    for v in poly:
        steps = [int(m.group(1)) for m in re.finditer(r'(?:^|\s)(\d+)', v['n'])]
        v['c'] = pick_clef(steps)
    return poly


def vname(n):
    n = re.sub(r'[\[\]]', '', n or '').strip()
    n = re.sub(r'([a-z])([A-Z])', r'\1 \2', n)
    m = re.match(r'^(I{1,3}|IV|V)\.?\s+(.+)$', n)
    if m: n = f"{m.group(2)} {['I', 'II', 'III', 'IV', 'V'].index(m.group(1)) + 1}"
    n = re.sub(r'([A-Za-z])(\d+)$', r'\1 \2', n)
    return n


works = {}   # code -> list of (kind, masstitle, item-stub)
pieces = {}  # id -> piece
seen_titles = {}  # (code, norm(title incl. mass)) -> id
fails = []

# existing JRP titles, so as not to add a piece twice
jrp_index = json.load(open(f'{OUT}/index.json', encoding='utf-8'))
jrp_index = [c for c in jrp_index if not c.get('extra')]
jrp_codes = {c['code'] for c in jrp_index}
jrp_search = json.load(open(f'{OUT}/search.json', encoding='utf-8'))
jrp_search = [x for x in jrp_search if x[0][:3] in jrp_codes and not x[0].startswith(('X', 'CRIM'))]


def tkey(t):
    t = re.sub(r'\s*\(([^,()]+), ([^()]+)\)$', r' \2', t)
    t = re.sub(r'\s*\([^()]*\)$', '', t)
    return norm(t)


have = {tkey(t) + '|' + c for _, t, c in jrp_search}


def add(code, pid, kind, mass, mov, piece, has_text):
    key = (code, norm((mass or '') + (mov or piece['title'])))
    if key in seen_titles:
        old = seen_titles[key]
        if has_text and not any(v.get('lyr') for v in pieces[old]['poly']):
            pieces.pop(old)
            works[code] = [w for w in works[code] if w[2] != old]
        else:
            return
    full = C[code][0]
    if tkey(piece['title']) + '|' + full in have:
        return
    seen_titles[key] = pid
    pieces[pid] = piece
    works.setdefault(code, []).append((kind, mass, pid))


# ---------------- The 1520s Project ----------------
for d in sorted(os.listdir(SRC1520)):
    if d in SKIP1520 or d not in C: continue
    for f in sorted(glob.glob(f'{SRC1520}/{d}/*.krn')):
        txt = open(f, encoding='utf-8', errors='replace').read()
        yec = re.findall(r'^!!!YEC:\s*(.*)$', txt, re.M)
        yem = re.findall(r'^!!!YEM:\s*(.*)$', txt, re.M)
        ory = all('Benjamin Ory' in y for y in yec) if yec else True
        cc = any('CC' in y or 'Creative Commons' in y for y in yem)
        if not (ory or cc):
            fails.append((f, 'other rights holder: left out')); continue
        try:
            meta, item = kbuild(f)
        except Exception as e:
            fails.append((f, repr(e))); continue
        if not item['poly'] or not any(v['n'] for v in item['poly']):
            fails.append((f, 'empty')); continue
        base = os.path.basename(f).split('-')[0]
        pid = ('X' + base) if d in jrp_codes else base
        com = u(meta.get('COM') or '')
        otl = u(meta.get('OTL') or os.path.basename(f).split('-', 1)[1][:-4].replace('_', ' '))
        opr = u(meta.get('OPR', '')).strip()
        agn = u(meta.get('AGN', ''))
        short = C[d][1]
        if com and '?' in com: short += '?'
        title = f'{otl} ({short}, {opr})' if opr and agn.startswith('Mass') else f'{otl} ({short})'
        nv = len(item['poly'])
        names = [v.get('nm') for v in item['poly']]
        bits = [f"{C[d][0]}{' (doubtful attribution)' if com and '?' in com else ''}, {opr + ', ' if opr else ''}{otl}."]
        bits.append(f'{nv} voices' + (f" ({', '.join(n for n in names if n)})" if all(names) else '') + ', each on its own staff.')
        if meta.get('SMS'): bits.append(f"Source: {u(meta['SMS'])}.")
        if not any(v.get('lyr') for v in item['poly']): bits.append('No text in this edition.')
        bits.append('Note values as in the edition (whole note = semibreve), at the original pitch; coloured notes stand for the triplet groups; editorial accidentals small above the staff.')
        enc = u(meta.get('EED') or meta.get('ENC') or 'Benjamin Ory')
        cr = f'From The 1520s Project (1520s-project.org, {base}); encoded by {enc}. Licence: {LIC}.'
        piece = {'title': title, 'desc': ' '.join(bits), 'cr': cr, 't': item['t'], 'b': item['b'], 'jrp': pid,
                 'poly': reclef(item['poly'])}
        piece['c'] = piece['poly'][0]['c']
        if item['cut']: piece['cut'] = True
        if item.get('ms'): piece['ms'] = item['ms']
        kind = 'mass' if agn.startswith('Mass') and opr.lower().startswith('missa') else 'sections' if agn.startswith('Mass') else 'motets' if 'Motet' in agn else 'songs' if any(k in agn for k in ('Chanson', 'Madrigal', 'Secular', 'Frottola')) else 'other'
        add(d, pid, kind, opr if kind == 'mass' else '', otl, piece, any(v.get('lyr') for v in item['poly']))

# ---------------- CRIM ----------------
rows = list(csv.reader(open(f'{SRCCRIM}/list.tsv', encoding='utf-8'), delimiter='\t'))
for pid, comp, ttl, mass, genre, date, nv, link in rows:
    code = CRIMNAME.get(comp)
    path = f'{SRCCRIM}/{pid}.mei'
    if not code or not os.path.exists(path): continue
    try:
        meta, met, st = mread(path)
    except Exception as e:
        fails.append((path, repr(e))); continue
    voices = [s for s in st.values() if any(not e['r'] for e in s['ev'])]
    if not voices:
        fails.append((path, 'empty')); continue
    gb = sum(1 for s in voices if s['key'].get('b') == -1) * 2 > len(voices)
    for s in voices:
        s['sigflat'] = {L for L, a in s['key'].items() if a == -1}
        s['name'] = vname(s['name'])
    cnt, unit = met
    perfect = cnt == '3' and unit == '1'
    poly = emit(voices, gb, perfect)
    short = C[code][1]
    mass = mass.strip()
    title = f'{ttl} ({short}, {mass})' if mass else f'{ttl} ({short})'
    names = [v.get('nm') for v in poly]
    bits = [f"{C[code][0]}, {mass + ', ' if mass else ''}{ttl}{', ' + date if date else ''}."]
    bits.append(f'{len(poly)} voices' + (f" ({', '.join(n for n in names if n)})" if all(names) else '') + ', each on its own staff.')
    if not any(v.get('lyr') for v in poly): bits.append('No text in this edition.')
    bits.append('Note values as in the edition (whole note = semibreve), at the original pitch; editorial accidentals small above the staff.')
    eds = ', '.join(meta.get('editors') or [])
    cr = f"From CRIM, Citations: The Renaissance Imitation Mass (crimproject.org, {pid})" + (f'; edited by {eds}' if eds else '') + f'. Licence: {LIC}.'
    piece = {'title': title, 'desc': ' '.join(bits), 'cr': cr, 't': 'O' if perfect else 'C', 'b': gb, 'jrp': pid, 'poly': poly, 'c': poly[0]['c']}
    if not perfect: piece['cut'] = True
    kind = 'mass' if mass else ('motets' if genre == 'motet' else 'songs')
    add(code, pid, kind, mass, ttl, piece, any(v.get('lyr') for v in poly))

# ---------------- write ----------------
os.makedirs(f'{OUT}/p', exist_ok=True); os.makedirs(f'{OUT}/c', exist_ok=True)
for pid, p in pieces.items():
    with open(f'{OUT}/p/{pid}.json', 'w', encoding='utf-8') as fh:
        json.dump(p, fh, ensure_ascii=False, separators=(',', ':'))


def stub(pid):
    p = pieces[pid]
    top = p['poly'][0]['n'].split()
    s = {k: p[k] for k in ('title', 'desc', 't', 'b', 'c', 'cut') if k in p}
    s['n'] = ' '.join(top[:30]); s['jrp'] = pid
    return s


def mov_rank(t):
    return next((i for i, w in enumerate(MOVE) if t.startswith(w)), 9)


index = list(jrp_index)
search = list(jrp_search)
for code, lst in works.items():
    subs = []
    masses = {}
    for kind, mass, pid in lst:
        if kind == 'mass': masses.setdefault(mass, []).append(pid)
    if masses:
        ms = []
        for m in sorted(masses, key=lambda x: x.lower()):
            ids = sorted(masses[m], key=lambda i: (mov_rank(pieces[i]['title']), i))
            ms.append({'group': m, 'note': f'{C[code][0]}. The movements of the mass, each on its own.', 'items': [stub(i) for i in ids]})
        subs.append({'group': 'Masses', 'note': f'{len(ms)} {"mass" if len(ms) == 1 else "masses"}, movement by movement.', 'subs': ms})
    for kind, gt, gn in (('sections', 'Mass movements', 'Single movements, not part of a whole mass here.'),
                         ('motets', 'Motets', 'Motets, in all their voices.'),
                         ('songs', 'Songs', 'Chansons, madrigals and other songs, in all their voices.'),
                         ('other', 'Other pieces', 'Everything else.')):
        ids = [pid for k, m, pid in lst if k == kind]
        if ids:
            ids.sort(key=lambda i: pieces[i]['title'].lower())
            subs.append({'group': gt, 'note': gn, 'items': [stub(i) for i in ids]})
    count = len(lst)
    if code in jrp_codes:
        # add to the composer's group from the Josquin collection
        cj = json.load(open(f'{OUT}/c/{code}.json', encoding='utf-8'))
        cj['subs'] = [s for s in cj['subs'] if not s.get('extra')]
        cj['subs'].append({'group': 'More from The 1520s Project and CRIM', 'note': 'Further pieces, from other digital editions.', 'subs': subs, 'extra': True})
        with open(f'{OUT}/c/{code}.json', 'w', encoding='utf-8') as fh:
            json.dump(cj, fh, ensure_ascii=False, separators=(',', ':'))
        for c in index:
            if c['code'] == code:
                c['count'] = sum(1 for x in jrp_search if x[2] == C[code][0]) + count
                c['note'] = f"{c['count']} pieces."
    else:
        with open(f'{OUT}/c/{code}.json', 'w', encoding='utf-8') as fh:
            json.dump({'code': code, 'subs': subs}, fh, ensure_ascii=False, separators=(',', ':'))
        first = stub(lst[0][2])
        index.append({'code': code, 'group': C[code][0], 'count': count, 'extra': True,
                      'note': f'{count} {"piece" if count == 1 else "pieces"}' + (f', {len(masses)} {"mass" if len(masses) == 1 else "masses"}' if masses else '') + '.',
                      'first': {k: first[k] for k in ('title', 't', 'b', 'c', 'n', 'cut') if k in first}})
    for kind, mass, pid in lst:
        search.append([pid, pieces[pid]['title'], C[code][0]])

SURNAME = {'Jachet of Mantua': 'Jachet', 'Maistre Jan': 'Jan', 'Carpentras (Elzéar Genet)': 'Carpentras', 'Jacotin': 'Jacotin',
           'Renaldo': 'Renaldo', 'Bisgueria': 'Bisgueria', 'Boyleau': 'Boyleau', 'Le Santier': 'Santier', 'Orlande de Lassus': 'Lassus',
           'Giovanni Pierluigi da Palestrina': 'Palestrina', 'Jacobus Clemens non Papa': 'Clemens', 'Nicolle des Celliers de Hesdin': 'Hesdin',
           'Didier Lupi Second': 'Lupi', 'Tomás Luis de Victoria': 'Victoria', 'Cristóbal de Morales': 'Morales', 'Cipriano de Rore': 'Rore'}


def sortkey(c):
    if c['code'] == 'Ano': return (1, '')
    n = c['group']
    s = SURNAME.get(n) or re.sub(r'^(de |la |le |da |des |van |von )+', '', n.split()[-1].lower())
    return (0, s.lower().replace('é', 'e').replace('è', 'e'))


index.sort(key=sortkey)
with open(f'{OUT}/index.json', 'w', encoding='utf-8') as fh:
    json.dump(index, fh, ensure_ascii=False, separators=(',', ':'))
with open(f'{OUT}/search.json', 'w', encoding='utf-8') as fh:
    json.dump(search, fh, ensure_ascii=False, separators=(',', ':'))
print('added pieces', len(pieces), 'composers', len(works), 'total', len(search))
for code, lst in sorted(works.items(), key=lambda x: -len(x[1])):
    print(f'  {code} {C[code][0]}: {len(lst)}')
print('fails', len(fails))
for f in fails[:40]: print(' ', f)
