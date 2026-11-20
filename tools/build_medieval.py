"""Ars antiqua and Ars nova motets for Cantare, from Measuring Polyphony (Karen Desmond; MusicXML; CC BY 3.0).
Writes OUT/p/MP_<name>.json, OUT/c/Med.json and adds the pieces to OUT/search.json.
Run after build_extra.py."""
import glob, json, os, re, sys
from fractions import Fraction as Fr
sys.path.insert(0, os.path.dirname(__file__))
from xml2cantare import read
from cantare_emit import emit

OUT = sys.argv[1]
SRC = '/home/claude/src/mp-music-files/MusicXML'
MENS = '/home/claude/src/mpj/assets/mensural'

SETS = [
    ('Montpellier', 'Ars antiqua: motets of the Montpellier Codex', 'Thirteenth-century motets from the seventh and eighth fascicles of the Montpellier Codex (Montpellier, Bibliothèque interuniversitaire, H 196): a tenor from chant, a motetus and a triplum, each with its own text.', 'Montpellier Codex'),
    ('Fauv', 'Ars nova: motets of the Roman de Fauvel', 'Motets from the interpolated Roman de Fauvel (Paris, BnF fr. 146, c. 1317), among them the first isorhythmic motets, some ascribed to Philippe de Vitry.', 'Roman de Fauvel'),
    ('IvTrem', 'Ars nova: isorhythmic motets', 'Fourteenth-century isorhythmic motets from the Ivrea Codex and related sources (Trémoïlle, Fribourg, Durham, Cambrai), several by or ascribed to Philippe de Vitry.', 'Ivrea Codex'),
]
# titles as they are usually cited: triplum / motetus / tenor
NAMES = {
    'in_nova': ('Garrit gallus / In nova fert / Neuma', 'Vitry'),
    'quoniam': ('Tribum que non abhorruit / Quoniam secta latronum / Merito hec patimur', 'Vitry'),
    'adesto': ('Firmissime fidem teneamus / Adesto, sancta Trinitas / Alleluya, Benedictus', 'Vitry?'),
    'hugo': ('Hugo, Hugo, princeps invidie / Cum statua Nabucodonasor / Ita est', 'Vitry'),
    'virtutibus': ('Impudenter circumivi / Virtutibus laudabilis / Alma redemptoris mater', 'Vitry'),
    'gratissima': ('Vos qui admiramini / Gratissima virginis species / Gaude gloriosa', 'Vitry'),
    'rex_quem': ('O canenda vulgo per compita / Rex quem metrorum / Rex regum', 'Vitry'),
    'bona': ('Colla iugo subdere / Bona condit cetera / Libera me, Domine', 'Vitry'),
    'in_arboris': ('Tuba sacre fidei / In arboris empiro / Virgo sum', 'Vitry?'),
    'decens': ('Petre Clemens / Lugentium siccentur / Non est inventus similis', 'Vitry?'),
    '340': ('Balaam inquit vaticinans / Balaam inquit vaticinans / Balaam', None),
    '341': ('Huic ut placuit / Huic ut placuit / Huic ut', None),
    '322': ('Mariae assumptio / Huius chori / Tenor', None),
    've_qui': ('Ve qui gregi deficis / Quoniam secta latronum? / Merito', None),
}


def incipit(ev, n=4):
    words, cur = [], ''
    for e in ev:
        t = e.get('txt')
        if not t: continue
        if t.endswith('-'): cur += t[:-1]
        else:
            words.append(cur + t); cur = ''
        if len(words) >= n or re.search(r'[.,;:!?]$', words[-1] if words else ''):
            break
    s = ' '.join(words).strip(' ,.;:')
    s = re.sub(r'\s+', ' ', s)
    return s[:1].upper() + s[1:].lower() if s.isupper() else s


def mens_meta(name):
    p = f'{MENS}/{name}_MENSURAL.mei'
    if not os.path.exists(p): return None, None
    s = open(p, encoding='utf-8', errors='replace').read()[:30000]
    t = re.search(r'<title[^>]*>([^<:]+)', s)
    c = re.search(r'<(?:composer|persName role="composer")[^>]*>([^<]+)', s)
    return (t.group(1).strip() if t else None), (c.group(1).strip() if c else None)


def clean(e_list):
    for e in e_list:
        e['u'] = Fr(e['u']).limit_denominator(24)
    return e_list


search = json.load(open(f'{OUT}/search.json', encoding='utf-8'))
search = [x for x in search if not x[0].startswith('MP_')]
subs = []
count = 0
for folder, gname, gnote, src in SETS:
    items = []
    for f in sorted(glob.glob(f'{SRC}/{folder}/*.xml')):
        name = os.path.basename(f)[:-4]
        try:
            meta, met, parts = read(f)
        except Exception as e:
            print('fail', f, e); continue
        parts = [p for p in parts if any(not e['r'] for e in p['ev'])]
        if not parts: continue
        for p in parts:
            clean(p['ev'])
            p['sigflat'] = {L for L, a in p['key'].items() if a == -1}
            p['name'] = (p['name'] or '').strip().capitalize().replace('Moetus', 'Motetus')
        if all(re.fullmatch(r'P\d', p['name'] or '') for p in parts):
            for p, nm in zip(parts, ['Triplum', 'Motetus', 'Tenor', 'Contratenor']): p['name'] = nm
        beats = int(met[0]) if met and met[0] else 4
        perfect = beats % 3 == 0
        gb = sum(1 for p in parts if p['key'].get('b') == -1) * 2 > len(parts)
        poly = emit(parts, gb, perfect, cap=24)
        # voices top first: triplum, motetus, (contratenor), tenor — the order of the edition
        mt, mc = mens_meta(name)
        if name in NAMES:
            title, who = NAMES[name]
        else:
            inc = [incipit(p['ev'], 3 if 'enor' not in p['name'] else 2) for p in parts]
            title = ' / '.join(i for i in inc if i) or (mt or name)
            who = None
            if mc and 'Vitry' in mc: who = 'Vitry?' if 'attrib' in mc else 'Vitry'
        tag = (who.replace('?', ' (attrib.)') if who else 'anonymous') + ', ' + src
        if folder == 'IvTrem' and (mt or '') and not who:
            tag = 'anonymous, Ars nova'
        full = f'{title} ({tag})'
        pid = 'MP_' + name
        nv = len(poly)
        desc = (f"{'Philippe de Vitry' + (' (attributed)' if who and '?' in who else '') if who else 'Anonymous'}, {title}. "
                f"{nv} voices ({', '.join(v.get('nm', '') for v in poly)}), each on its own staff. "
                'Transcribed from the original mensural notation at the original pitch; note values as in the edition (whole note = semibreve), '
                'a perfect value written with a dot. The tenor is a chant melody laid out in a repeated rhythm.')
        cr = f'From Measuring Polyphony (measuringpolyphony.org, ed. Karen Desmond). Licence: CC BY 3.0.'
        piece = {'title': full, 'desc': desc, 'cr': cr, 't': 'O' if perfect else 'C', 'b': gb, 'jrp': pid, 'poly': poly, 'c': poly[0]['c']}
        with open(f'{OUT}/p/{pid}.json', 'w', encoding='utf-8') as fh:
            json.dump(piece, fh, ensure_ascii=False, separators=(',', ':'))
        top = poly[0]['n'].split()
        items.append({'title': full, 'desc': desc, 't': piece['t'], 'b': gb, 'c': poly[0]['c'], 'n': ' '.join(top[:30]), 'jrp': pid})
        search.append([pid, full, gname])
        count += 1
    items.sort(key=lambda it: it['title'].lower())
    subs.append({'group': gname, 'note': gnote, 'items': items})

with open(f'{OUT}/c/Med.json', 'w', encoding='utf-8') as fh:
    json.dump({'code': 'Med', 'subs': subs}, fh, ensure_ascii=False, separators=(',', ':'))
with open(f'{OUT}/search.json', 'w', encoding='utf-8') as fh:
    json.dump(search, fh, ensure_ascii=False, separators=(',', ':'))
print('medieval pieces', count, 'search total', len(search))
