"""Read a common-notation MEI file (CRIM editions) into per-voice events for cantare_emit."""
import re, sys, json
import xml.etree.ElementTree as ET
from fractions import Fraction as Fr

NS = '{http://www.music-encoding.org/ns/mei}'
XID = '{http://www.w3.org/XML/1998/namespace}id'
ACC = {'f': -1, 's': 1, 'n': 0, 'ff': -2, 'x': 2}
DUR = {'maxima': Fr(16), 'long': Fr(8), 'breve': Fr(4), '1': Fr(2), '2': Fr(1), '4': Fr(1, 2), '8': Fr(1, 4), '16': Fr(1, 8), '32': Fr(1, 16)}


def tag(e): return e.tag.replace(NS, '')


def length(e, tup):
    d = e.get('dur')
    if d not in DUR:
        return None
    m = DUR[d]
    dots = int(e.get('dots') or 0)
    for c in e:
        if tag(c) == 'dot': dots += 1
    tot, add = m, m
    for _ in range(dots):
        add /= 2; tot += add
    return tot * tup


def sig_flats(ks):
    m = re.match(r'(\d)([fs])', ks or '')
    if not m: return {}
    n = int(m.group(1))
    order = 'beadgcf' if m.group(2) == 'f' else 'fcgdaeb'
    return {L: (-1 if m.group(2) == 'f' else 1) for L in order[:n]}


def read(path):
    root = ET.parse(path).getroot()
    head = root.find(f'{NS}meiHead')
    meta = {}
    if head is not None:
        t = head.find(f'.//{NS}titleStmt/{NS}title')
        meta['title'] = (t.text or '').strip() if t is not None else ''
        meta['composer'] = [(p.text or '').strip() for p in head.iter(f'{NS}persName') if p.get('role') == 'composer'][:1]
        meta['editors'] = [(p.text or '').strip() for p in head.iter(f'{NS}persName') if p.get('role') == 'editor']
        av = head.find(f'.//{NS}availability')
        meta['lic'] = ''.join(av.itertext()).strip() if av is not None else ''
    music = root.find(f'.//{NS}music')
    staves = {}   # n -> dict(name, key, ev)
    for sd in music.iter(f'{NS}staffDef'):
        n = sd.get('n')
        if n in staves: continue
        lab = sd.get('label') or ''
        le = sd.find(f'{NS}label')
        if le is not None and not lab: lab = ''.join(le.itertext()).strip()
        staves[n] = {'name': lab.strip(), 'key': sig_flats(sd.get('key.sig')), 'ev': [], 'met': (sd.get('meter.count'), sd.get('meter.unit'))}
    sdef = music.find(f'.//{NS}scoreDef')
    gkey = sig_flats(sdef.get('key.sig')) if sdef is not None and sdef.get('key.sig') else None
    if gkey is not None:
        for s in staves.values():
            if not s['key']: s['key'] = dict(gkey)
    met = (sdef.get('meter.count'), sdef.get('meter.unit')) if sdef is not None else (None, None)
    if not met[0]:
        met = next((s['met'] for s in staves.values() if s['met'][0]), (None, None))
    byid = {}
    tie_start, tie_end = set(), set()
    for t in music.iter(f'{NS}tie'):
        if t.get('startid'): tie_start.add(t.get('startid').lstrip('#'))
        if t.get('endid'): tie_end.add(t.get('endid').lstrip('#'))
    for meas in music.iter(f'{NS}measure'):
        # key changes inside the piece
        mlen = {}
        for st in meas.findall(f'{NS}staff'):
            n = st.get('n')
            if n not in staves: continue
            lay = st.find(f'{NS}layer')
            if lay is None: continue
            evs = []
            walk(lay, evs, Fr(1), False, byid)
            mlen[n] = (evs, sum((e['u'] for e in evs if e.get('u') is not None), Fr(0)))
        full = max([x[1] for x in mlen.values()] + [Fr(0)])
        for n, (evs, tot) in mlen.items():
            for e in evs:
                if e.get('mrest'):
                    e['u'] = full if full else Fr(0)
                    e.pop('mrest')
            staves[n]['ev'].extend(e for e in evs if e['u'])
    # sounding accidentals, ties
    for n, s in staves.items():
        out = []
        for e in s['ev']:
            if e['r']:
                if out and out[-1]['r']: out[-1]['u'] += e['u']
                else: out.append(e)
                continue
            if e['acc'] is None:
                e['acc'] = s['key'].get('cdefgab'[e['s'] % 7], 0)
            if (e.get('tie') in ('t', 'm') or e['id'] in tie_end) and out and not out[-1]['r'] and out[-1]['s'] == e['s'] and out[-1].get('open'):
                out[-1]['u'] += e['u']
                out[-1]['open'] = e.get('tie') == 'm' or e['id'] in tie_start
                continue
            e['open'] = e.get('tie') in ('i', 'm') or e['id'] in tie_start
            out.append(e)
        s['ev'] = out
    return meta, met, staves


def walk(node, evs, tup, supplied, byid):
    for c in node:
        t = tag(c)
        if t in ('beam', 'ligature', 'choice', 'corr', 'reg', 'app', 'lem', 'bTrem', 'fTrem'):
            walk(c, evs, tup, supplied, byid)
        elif t == 'supplied':
            walk(c, evs, tup, True, byid)
        elif t == 'tuplet':
            num, nb = int(c.get('num') or 3), int(c.get('numbase') or 2)
            walk(c, evs, tup * Fr(nb, num), supplied, byid)
        elif t == 'chord':
            ns = [x for x in c if tag(x) == 'note']
            if ns:
                top = max(ns, key=lambda x: int(x.get('oct') or 4) * 7 + 'cdefgab'.index((x.get('pname') or 'c').lower()))
                for k, v in c.attrib.items():
                    top.attrib.setdefault(k, v)
                note(top, evs, tup, supplied, byid)
        elif t == 'note':
            note(c, evs, tup, supplied, byid)
        elif t in ('rest', 'space'):
            u = length(c, tup)
            if c.get('dur.ppq') and c.get('dur') is None:
                u = Fr(int(c.get('dur.ppq')), 512)
            if u: evs.append({'r': True, 'u': u})
        elif t in ('mRest', 'mSpace', 'multiRest'):
            evs.append({'r': True, 'u': None, 'mrest': True})


def note(c, evs, tup, supplied, byid):
    u = length(c, tup)
    if u is None: return
    pn = (c.get('pname') or 'c').lower()
    s = int(c.get('oct') or 4) * 7 + 'cdefgab'.index(pn)
    acc, edit = None, False
    a = c.get('accid') or c.get('accid.ges')
    if a in ACC: acc = ACC[a]
    for x in c.iter(f'{NS}accid'):
        v = x.get('accid') or x.get('accid.ges')
        if v in ACC:
            acc = ACC[v]
            if x.get('func') == 'edit' or x.get('enclose') or x.get('func') == 'caution' and False:
                edit = True
    if acc is not None and c.find(f'{NS}supplied/{NS}accid') is not None:
        edit = True
    txt = None
    verse = c.find(f'{NS}verse')
    if verse is None:
        verse = c.find(f'.//{NS}verse')
    if verse is not None:
        syls = verse.findall(f'.//{NS}syl')
        if syls:
            parts = []
            for sy in syls:
                w = ''.join(sy.itertext()).strip()
                if sy.get('wordpos') in ('i', 'm') or sy.get('con') == 'd':
                    w += '-' if sy.get('wordpos') in ('i', 'm') else ''
                parts.append(w)
            txt = '_'.join(p for p in parts if p) or None
    e = {'r': False, 'u': u, 's': s, 'acc': acc, 'edit': edit or (supplied and acc), 'id': c.get(XID), 'tie': c.get('tie')}
    if txt: e['txt'] = txt
    evs.append(e)


if __name__ == '__main__':
    meta, met, st = read(sys.argv[1])
    print(meta, met)
    for n, s in st.items():
        print(n, s['name'], s['key'], len(s['ev']), sum(e['u'] for e in s['ev']), [(e.get('s'), str(e['u']), e.get('acc'), e.get('txt')) for e in s['ev'][:10]])
