"""Build the Josquin Research Project library for Cantare super librum.
Writes OUT/index.json, OUT/c/<code>.json (works of one composer, light), OUT/p/<id>.json (each piece, full)."""
import glob, json, os, re, sys, html, traceback
sys.path.insert(0, os.path.dirname(__file__))
from kern2cantare import build

SRC = '/home/claude/josquin-research-project/jrp-scores'
OUT = sys.argv[1]
NAMES = {
    'Ano': 'Anonymous', 'Agr': 'Alexander Agricola', 'Bin': 'Gilles Binchois', 'Bru': 'Antoine Brumel',
    'Bus': 'Antoine Busnoys', 'Com': 'Loyset Compère', 'Das': 'Ludwig Daser', 'Duf': 'Guillaume Du Fay',
    'Fry': 'Walter Frye', 'Fva': 'Antoine de Févin', 'Gas': 'Gaspar van Weerbeke', 'Isa': 'Heinrich Isaac',
    'Jap': 'Jean Japart', 'Jos': 'Josquin des Prez', 'Mar': 'Johannes Martini', 'Mou': 'Jean Mouton',
    'Obr': 'Jacob Obrecht', 'Oke': 'Johannes Ockeghem', 'Ort': 'Marbrianus de Orto', 'Pip': 'Matthaeus Pipelare',
    'Reg': 'Johannes Regis', 'Rue': 'Pierre de la Rue', 'Tin': 'Johannes Tinctoris'}
SHORT = {'Ano': 'Anonymous', 'Agr': 'Agricola', 'Bin': 'Binchois', 'Bru': 'Brumel', 'Bus': 'Busnoys', 'Com': 'Compère',
         'Das': 'Daser', 'Duf': 'Du Fay', 'Fry': 'Frye', 'Fva': 'Févin', 'Gas': 'Gaspar', 'Isa': 'Isaac', 'Jap': 'Japart',
         'Jos': 'Josquin', 'Mar': 'Martini', 'Mou': 'Mouton', 'Obr': 'Obrecht', 'Oke': 'Ockeghem', 'Ort': 'de Orto',
         'Pip': 'Pipelare', 'Reg': 'Regis', 'Rue': 'La Rue', 'Tin': 'Tinctoris'}
MOVE = ['Kyrie', 'Gloria', 'Credo', 'Sanctus', 'Agnus']


def u(x):
    return html.unescape(x or '').strip()


def person(x):
    """'la Rue, Pierre de' -> 'Pierre de la Rue'"""
    x = u(x)
    if ',' in x and x.count(',') == 1:
        a, b = [t.strip() for t in x.split(',')]
        return f'{b} {a}'
    return x


def credit_name(x):
    x = u(x)
    return person(x) if re.match(r'^[^,]+, [^,]+$', x) else x


os.makedirs(OUT + '/c', exist_ok=True)
os.makedirs(OUT + '/p', exist_ok=True)
index = []
fails = []
total_bytes = 0
for code in sorted(NAMES, key=lambda c: (c == 'Ano', NAMES[c].split()[-1])):
    files = sorted(glob.glob(f'{SRC}/{code}/*.krn'))
    if not files:
        continue
    works = {}   # key -> {title, note, items, kind}
    order = []
    for f in files:
        try:
            meta, item = build(f)
        except Exception as e:
            fails.append((f, repr(e))); continue
        if not item['poly'] or not any(v['n'] for v in item['poly']):
            fails.append((f, 'empty')); continue
        jid = os.path.basename(f).split('-')[0]
        com = u(meta.get('COM') or meta.get('COA') or '')
        comp_label = SHORT[code]
        if com and code != 'Ano':
            last = person(com).split()[-1].rstrip('?')
            if last.lower() not in NAMES[code].lower() and last.lower() not in comp_label.lower():
                comp_label = person(com)
        if code == 'Ano' and meta.get('COS'):
            comp_label = 'Anonymous'
        otl = u(meta.get('OTL') or meta.get('OTL@@LAT') or meta.get('OTL@@FRA') or meta.get('OTL@@FRE') or os.path.basename(f).split('-', 1)[1][:-4].replace('_', ' '))
        opr = u(meta.get('OPR', ''))
        agn = u(meta.get('AGN', ''))
        nv = len(item['poly'])
        names = [v.get('nm') for v in item['poly']]
        title = f'{otl} ({comp_label}, {opr})' if opr else f'{otl} ({comp_label})'
        # description
        bits = []
        who = person(com) if com else NAMES[code]
        if com and '?' in com:
            who = person(com).replace('?', '') + ' (doubtful attribution)'
        if meta.get('COS'):
            who += f', attributed to {u(meta["COS"])}'
        bits.append(f'{who}, {opr + ", " if opr else ""}{otl}.')
        vn = ', '.join(n for n in names if n) if all(names) else ''
        bits.append(f'{nv} voices' + (f' ({vn})' if vn else '') + ', each on its own staff.')
        if meta.get('SMS'):
            bits.append(f'Source: {u(meta["SMS"])}.')
        ed = []
        if meta.get('PED'):
            ed.append(f'edited by {credit_name(meta["PED"])} ({u(meta.get("PTL", ""))}{", " + u(meta["PDT"]) if meta.get("PDT") else ""})')
        enc = meta.get('EED')
        bits.append(f'From the Josquin Research Project (josquin.stanford.edu, {jid})' + (', ' + ed[0] if ed else '') +
                    (f'; encoded by {credit_name(enc)}' if enc else '') + '. CC BY-NC 4.0.')
        bits.append('Note values as in the edition (whole note = semibreve); coloured notes stand for the triplet groups; editorial accidentals small above the staff.')
        if not any(v.get('lyr') for v in item['poly']):
            bits.append('No text in this edition.')
        desc = ' '.join(bits)
        piece = {'title': title, 'desc': desc, 't': item['t'], 'b': item['b'], 'c': item['poly'][0]['c'], 'poly': item['poly']}
        if item['cut']:
            piece['cut'] = True
        js = json.dumps(piece, ensure_ascii=False, separators=(',', ':'))
        with open(f'{OUT}/p/{jid}.json', 'w', encoding='utf-8') as fh:
            fh.write(js)
        total_bytes += len(js.encode())
        top = item['poly'][0]['n'].split()
        stub = {'title': title, 'desc': desc, 't': item['t'], 'b': item['b'], 'c': item['poly'][0]['c'],
                'n': ' '.join(top[:30]), 'jrp': jid}
        if item['cut']:
            stub['cut'] = True
        # grouping
        if agn.startswith('Mass') and opr:
            key = 'M:' + re.sub(r'[^a-z]', '', opr.lower()).replace('regrets', 'regretz'); kind = 'mass'
            gtitle = opr; gnote = f'{NAMES[code] if comp_label == SHORT[code] else comp_label}. The movements of the mass, each on its own.'
        elif agn.startswith('Mass'):
            key = 'K:sections'; kind = 'sections'; gtitle = 'Mass movements'; gnote = 'Single movements, not part of a whole mass here.'
        elif 'Motet' in agn:
            key = 'K:motets'; kind = 'motets'; gtitle = 'Motets'; gnote = 'Motets, in all their voices.'
        elif 'Song' in agn or 'Chanson' in agn:
            key = 'K:songs'; kind = 'songs'; gtitle = 'Songs'; gnote = 'Chansons and other songs, in all their voices.'
        else:
            key = 'K:other'; kind = 'other'; gtitle = 'Other pieces'; gnote = 'Everything else.'
        if key not in works:
            works[key] = {'group': gtitle, 'note': gnote, 'items': [], 'kind': kind}
            order.append(key)
        works[key]['items'].append(stub)
    masses = [works[k] for k in order if works[k]['kind'] == 'mass']
    for m in masses:
        m['items'].sort(key=lambda it: (next((i for i, w in enumerate(MOVE) if it['title'].startswith(w)), 9), it['jrp']))
    subs = []
    if masses:
        subs.append({'group': 'Masses', 'note': f'{len(masses)} {"mass" if len(masses) == 1 else "masses"}, movement by movement.', 'subs': [{'group': m['group'], 'note': m['note'], 'items': m['items']} for m in masses]})
    for kind in ('sections', 'motets', 'songs', 'other'):
        for k in order:
            w = works[k]
            if w['kind'] == kind:
                subs.append({'group': w['group'], 'note': w['note'], 'items': w['items']})
    count = sum(len(w['items']) for w in works.values())
    if not count:
        continue
    with open(f'{OUT}/c/{code}.json', 'w', encoding='utf-8') as fh:
        json.dump({'code': code, 'subs': subs}, fh, ensure_ascii=False, separators=(',', ':'))
    first = next(iter(works.values()))['items'][0]
    index.append({'code': code, 'group': NAMES[code], 'count': count,
                  'note': f'{count} {"piece" if count == 1 else "pieces"}' + (f', {len(masses)} {"mass" if len(masses) == 1 else "masses"}' if masses else '') + '.',
                  'first': {k: first[k] for k in ('title', 't', 'b', 'c', 'n', 'cut') if k in first}})
with open(f'{OUT}/index.json', 'w', encoding='utf-8') as fh:
    json.dump(index, fh, ensure_ascii=False, separators=(',', ':'))
print('composers', len(index), 'pieces', sum(c['count'] for c in index), 'MB', round(total_bytes / 1e6, 1))
print('fails', len(fails))
for f in fails[:30]:
    print(' ', f)
