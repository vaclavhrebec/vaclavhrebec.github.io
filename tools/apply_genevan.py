"""Put the extracted Genevan tunes into the Cantare library and underlay Marot's first stanzas where they fit phrase by phrase."""
import json, re, sys
from functools import lru_cache
sys.path.insert(0, '/home/claude/src/fr')
import marot
from fr_syll import line_options
P = '/home/claude/repo/site/gym/cantare/data/library.json'
d = json.load(open(P))

def find(n, name):
    for x in n:
        if x.get('group') == name: return x
        r = find(x.get('subs', []), name)
        if r: return r

g = find(d, 'Genevan Psalms')
keep = [it for it in g['items'] if 'genevanpsalter.com' not in it.get('desc', '')]
old_ids = {it['title'].split(',')[0].split(' (')[0]: it['id'] for it in g['items'] if 'genevanpsalter.com' in it.get('desc', '')}
ids = []
def walk(n):
    for x in n:
        ids.extend(i['id'] for i in x.get('items', []) if 'id' in i); walk(x.get('subs', []))
walk(d)
nid = max(ids) + 1
FIX = {"Psalm 3": "O Seigneur, que de gens", "Psalm 20": "Le Seigneur ta priere", "Psalm 21": "Seigneur, le Roy s'esjouira", "Psalm 26": "Seigneur, garde mon droict",
       "Psalm 35": "Debats contre mes debateurs", "Psalm 39": "J'ay dit en moy", "Psalm 34": "Jamais ne cesseray", "Psalm 69": "Helas, Seigneur, je te pri'",
       "Psalm 72": "Tes jugemens, Dieu veritable", "Psalm 83": "O Dieu, ne sois plus à requoy", "Psalm 88": "O Dieu eternel, mon Sauveur",
       "Psalm 102": "Seigneur, enten ma requeste", "Psalm 104": "Sus, sus, mon ame, il te faut dire bien", "Psalm 105": "Sus, qu'un chacun de nous",
       "Psalm 106": "Louez Dieu, car il est benin", "Psalm 107": "Donnez au Seigneur gloire", "Psalm 110": "L'Omnipotent à mon Seigneur",
       "Psalm 112": "O bienheureuse la personne", "Psalm 114": "Quand Israël hors d'Egypte sortit", "Psalm 125": "Tout homme qui son esperance",
       "Psalm 136": "Louez Dieu tout hautement", "Psalm 143": "Seigneur Dieu, oy l'oraison", "Psalm 147": "Louez Dieu, car c'est chose",
       "Psalm 80": "O Pasteur d'Israël, escoute", "Psalm 84": "O Dieu des armees", "Psalm 59": "Mon Dieu, l'ennemi m'environne"}
new = json.load(open('/home/claude/src/gen/genevan_new.json'))
for it in new:
    it.pop('_num', None)
    head = it['title'].split(',')[0].split(' (')[0]
    if head in FIX:
        it['title'] = re.sub(r'^([^,(]+)(?:, [^(]*)?\(', lambda m: f"{m.group(1).strip()}, {FIX[head]} (", it['title'])
    if head == 'The Ten Commandments':
        it['title'] = "The Ten Commandments, Leve le cueur, ouvre l'aureille (Genevan Psalter, 1543)"
    it['id'] = old_ids.get(head) or nid
    if it['id'] == nid: nid += 1
items = keep + new

def num(t):
    m = re.match(r'Psalm (\d+)', t); return int(m.group(1)) if m else 999
items.sort(key=lambda it: (num(it['title']), it['title']))
g['items'] = items

def opts(l):
    o = []
    line_options.cost = 0
    for op in line_options(l):
        cost = getattr(line_options, 'cost', 0) if o else 0
        flat = []
        for ss in op:
            for k, s in enumerate(ss): flat.append(s + ('-' if k < len(ss) - 1 and not s.endswith('-') else ''))
        if all(len(flat) != len(x[0]) for x in o): o.append((flat, cost))
        if len(o) >= 4: break
    return o

def fit_phrases(lines, phrases):
    O = [opts(l) for l in lines]
    @lru_cache(None)
    def go(li, pi):
        if pi == len(phrases): return () if li == len(lines) else None
        for lj in range(li + 1, min(len(lines), li + 4) + 1):
            def rec(k, rem):
                if k == lj: return (0, []) if rem == 0 else None
                best = None
                for f, c in O[k]:
                    if len(f) <= rem:
                        r = rec(k + 1, rem - len(f))
                        if r is not None and (best is None or c + r[0] < best[0]): best = (c + r[0], [f] + r[1])
                return best
            r = rec(li, phrases[pi]); r = r[1] if r else None
            if r is not None:
                rest = go(lj, pi + 1)
                if rest is not None: return tuple(r) + rest
        return None
    return go(0, 0)

MEL = {2, 6, 10, 13}
byn = {num(it['title']): it for it in items if 'genevanpsalter.com' in it.get('desc', '')}
done, undone = [], []
for n, lines in marot.T.items():
    if not lines or n in MEL or n not in byn: continue
    it = byn[n]
    ph = [len(re.findall(r'(?:^|\s)\d+[#bn^]*[A-Za-z]', x)) for x in it['n'].split('rS')]
    ph = [x for x in ph if x]
    res = fit_phrases(tuple(lines), tuple(ph))
    if not res: undone.append((n, ph)); continue
    it['lyr'] = ' '.join(s.replace(' ', '_') for l in res for s in l)
    it['desc'] += ' Text: Clément Marot, first stanza (after the nineteenth-century edition of his works).'
    first = lines[0].rstrip(',;:.!?')
    it['title'] = re.sub(r'^(Psalm \d+), [^(]*\(', lambda m: f'{m.group(1)}, {first} (', it['title'])
    done.append(n)
json.dump(d, open(P, 'w'), ensure_ascii=False)
print(len(g['items']), 'texted', done); print('not fitted', undone)
