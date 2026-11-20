"""Read a MusicXML score (Measuring Polyphony transcriptions) into per-voice events for cantare_emit."""
import re, sys
import xml.etree.ElementTree as ET
from fractions import Fraction as Fr

STEP = 'CDEFGAB'


def read(path):
    root = ET.parse(path).getroot()
    names = {}
    for sp in root.iter('score-part'):
        pn = sp.find('part-name')
        names[sp.get('id')] = (pn.text or '').strip() if pn is not None else ''
    meta = {
        'title': ''.join((root.findtext('work/work-title') or root.findtext('movement-title') or '')).strip(),
        'composer': next(((c.text or '').strip() for c in root.iter('creator') if c.get('type') == 'composer'), ''),
    }
    parts = []
    met = None
    for part in root.findall('part'):
        div = 1
        fifths = 0
        ev = []
        word_open = False
        for meas in part.findall('measure'):
            for el in meas:
                if el.tag == 'attributes':
                    if el.findtext('divisions'): div = int(el.findtext('divisions'))
                    if el.findtext('key/fifths') is not None: fifths = int(el.findtext('key/fifths'))
                    if met is None and el.find('time') is not None:
                        met = (el.findtext('time/beats'), el.findtext('time/beat-type'))
                elif el.tag == 'note':
                    if el.find('chord') is not None or el.find('grace') is not None: continue
                    d = el.findtext('duration')
                    if d is None: continue
                    u = Fr(int(d), 2 * div)     # a quarter is a semiminim: minims = duration / (2 * divisions)
                    if el.find('rest') is not None:
                        ev.append({'r': True, 'u': u}); continue
                    p = el.find('pitch')
                    s = int(p.findtext('octave')) * 7 + STEP.index(p.findtext('step'))
                    alt = p.findtext('alter')
                    acc = int(float(alt)) if alt is not None else None
                    a = el.find('accidental')
                    edit = (a is not None and (a.get('editorial') == 'yes' or a.get('parentheses') == 'yes' or a.get('bracket') == 'yes')) or (a is None and acc not in (None, 0) and not (acc == -1 and fifths < 0 and STEP[STEP.index(p.findtext('step'))] in 'BEADGCF'[:-fifths]))
                    ties = [t.get('type') for t in el.findall('tie')]
                    e = {'r': False, 'u': u, 's': s, 'acc': acc, 'edit': edit, 'tstart': 'start' in ties, 'tstop': 'stop' in ties, 'fifths': fifths}
                    ly = el.find('lyric')
                    if ly is not None and ly.findtext('text'):
                        syl = ly.findtext('syllabic') or 'single'
                        t = ly.findtext('text').strip()
                        e['txt'] = t + ('-' if syl in ('begin', 'middle') else '')
                    ev.append(e)
                elif el.tag == 'backup':
                    pass
        # sounding accidentals, ties
        out = []
        for e in ev:
            if e['r']:
                if out and out[-1]['r']: out[-1]['u'] += e['u']
                else: out.append(e)
                continue
            if e['acc'] is None:
                e['acc'] = 0
            if e['tstop'] and out and not out[-1]['r'] and out[-1]['s'] == e['s']:
                out[-1]['u'] += e['u']
                if not e['tstart']: out[-1]['tstart'] = False
                continue
            out.append(e)
        key = {}
        f0 = next((e['fifths'] for e in ev if not e['r']), 0)
        if f0 < 0: key = {L: -1 for L in 'beadgcf'[:-f0]}
        parts.append({'name': names.get(part.get('id'), ''), 'ev': out, 'key': key})
    return meta, met, parts


if __name__ == '__main__':
    meta, met, parts = read(sys.argv[1])
    print(meta, met)
    for p in parts:
        print(p['name'], p['key'], len(p['ev']), sum(e['u'] for e in p['ev']), [(e.get('s'), str(e['u']), e.get('acc'), e.get('txt')) for e in p['ev'][:12]])
