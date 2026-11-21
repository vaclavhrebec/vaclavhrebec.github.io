"""Syllabify 16th-century French verse for singing, one note per syllable, and fit it to a phrase of a given length."""
import re, itertools
V = 'aeiouyàâäéèêëîïôöùûüœæ'
VOWEL = re.compile(f'[{V}]', re.I)
# vowel groups that are one syllable by default; the alternative splits them (diaeresis)
GROUPS = ['eau', 'où', 'où', 'oeu', 'œu', 'ieu', 'iou', 'ueu', 'ai', 'ay', 'ei', 'ey', 'au', 'eu', 'ou', 'oi', 'oy', 'ui', 'uy', 'ie', 'ié', 'iè', 'io', 'ia', 'ue', 'ua', 'uo', 'ée', 'oe', 'œ']
SPLITTABLE = {'ieu', 'ie', 'ié', 'iè', 'io', 'ia', 'ue', 'ua', 'uo', 'ui', 'oi', 'ée', 'oe', 'ay', 'oy', 'uy'}


def vowel_units(w):
    """list of (start,end,group) for vowel groups of a word; q/g + u count as consonant"""
    lw = w.lower(); i = 0; out = []
    while i < len(lw):
        if lw[i] in V:
            if lw[i] == 'u' and i > 0 and (lw[i - 1] == 'q' or (lw[i - 1] == 'g' and i + 1 < len(lw) and lw[i + 1] in 'eéèiy')):
                i += 1; continue
            g = next((g for g in GROUPS if lw.startswith(g, i)), lw[i])
            out.append((i, i + len(g), g)); i += len(g)
        else: i += 1
    return out


def word_sylls(w, split_set=()):
    """split a word into sung syllables; split_set: indexes of vowel groups to break in two"""
    units = vowel_units(w)
    # break chosen groups
    u2 = []
    for k, (a, b, g) in enumerate(units):
        if k in split_set and len(g) >= 2:
            u2.append((a, a + 1, g[0])); u2.append((a + 1, b, g[1:]))
        else: u2.append((a, b, g))
    if not u2: return [w]
    # syllable boundaries: between vowel groups, one consonant goes with the next vowel; clusters split before last consonant
    # (keeping muta cum liquida together)
    cuts = []
    for (a1, b1, g1), (a2, b2, g2) in zip(u2, u2[1:]):
        cons = w[b1:a2].replace("qu'", 'Q').replace('qu', 'Q').replace('gu', 'G').replace('Qu', 'Q').replace('Gu', 'G')
        if len(cons) <= 1: cuts.append(b1)
        else:
            lc = cons.lower()
            raw = w[b1:a2]
            if cons[-1] in 'QG': cuts.append(a2 - (3 if raw.endswith(("qu'",)) else 2))
            elif len(lc) >= 2 and lc[-2] in 'bcdfgptv' and lc[-1] in 'lr': cuts.append(a2 - 2)
            elif lc[-2:] in ('ch', 'gn', 'ph', 'th'): cuts.append(a2 - 2)
            else: cuts.append(a2 - 1)
    parts = []; prev = 0
    for c in cuts:
        parts.append(w[prev:c]); prev = c
    parts.append(w[prev:])
    return parts


def mute_final(w):
    lw = w.lower().rstrip('.,;:!?')
    us = vowel_units(lw)
    if len(us) >= 2 and us[-1][2] == 'e' and re.search(r'(e|es|ent)$', lw) and not lw.endswith(('ée', 'ées')): return True
    return lw in ('que', 'ne', 'le', 'se', 'ce', 'me', 'te', 'de', 'je')


def line_options(line):
    """yield lists of syllables (strings) for the line, default first, then with diaereses"""
    words = line.split()
    base = []
    amb = []   # (word index, unit index)
    for wi, w in enumerate(words):
        core = w
        us = vowel_units(core)
        for k, (a, b, g) in enumerate(us):
            if g in SPLITTABLE and not (g == 'ieu' and not re.search(r'[cg]ieux?$', core.lower().rstrip('.,;:!?'))): amb.append((wi, k))
    def build(splits):
        sy = []
        carry = {}
        for wi, w in enumerate(words):
            ss = word_sylls(w, {k for (i, k) in splits if i == wi})
            nxt = words[wi + 1] if wi + 1 < len(words) else None
            last_word = nxt is None
            if len(ss) > 1 and mute_final(w):
                # final mute e: elided before a vowel or h, kept before a consonant and at the end of the line (feminine ending)
                if nxt and re.match(f'[{V}hH]', nxt) and not w.lower().rstrip('.,;:!?').endswith(('es', 'ent')):
                    ss = ss[:-1]; carry[wi + 1] = w[len(''.join(ss)):]; ss[-1] = ss[-1] + '-'
            elif len(ss) == 1 and nxt and w.lower() in ('que', 'ne', 'le', 'se', 'ce', 'me', 'te', 'de', 'je') and re.match(f'[{V}hH]', nxt):
                pass
            if wi in carry and ss:
                ss = [carry[wi] + '_' + ss[0]] + ss[1:]
            sy.append(ss)
        return sy
    PRI = {'ieu': 0, 'io': 0, 'ia': 1, 'ie': 2, 'ié': 2, 'iè': 2, 'ue': 3, 'ua': 3, 'uo': 3, 'ui': 4, 'ée': 4, 'oe': 5, 'oi': 6, 'ay': 7, 'oy': 7, 'uy': 7}
    amb.sort(key=lambda a: PRI.get(vowel_units(words[a[0]])[a[1]][2], 9))
    yield build(())
    for r in range(1, min(3, len(amb)) + 1):
        for comb in itertools.combinations(amb, r):
            b = build(comb)
            line_options.cost = sum(1 + PRI.get(vowel_units(words[a[0]])[a[1]][2], 9) for a in comb)
            yield b


def fit(line, n):
    """syllables of the line fitted to n notes, as a list of underlay tokens ('syl-' within a word), or None"""
    for opt in line_options(line):
        flat = []
        for ss in opt:
            for k, s in enumerate(ss):
                flat.append(s + ('-' if k < len(ss) - 1 and not s.endswith('-') else ''))
        if len(flat) == n: return flat
    return None
