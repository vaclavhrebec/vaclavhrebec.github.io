/* Tuning systems — The Ultimate Ear Trainer.
   Every temperament is defined by how much each of the twelve fifths is narrowed (in cents), going round the circle
   C–G–D–A–E–B–F♯–C♯–G♯ | E♭–B♭–F–C. From that chain all pitches, tables, beat rates and sounds are computed,
   so nothing in the tables is typed in by hand. */
(function () {
  'use strict';
  const PC = 1200 * Math.log2(531441 / 524288);   // Pythagorean comma, 23.46 c
  const SC = 1200 * Math.log2(81 / 80);           // syntonic comma, 21.51 c
  const SCH = PC - SC;                            // schisma, 1.95 c
  const FIFTH = 1200 * Math.log2(3 / 2);          // pure fifth, 701.96 c
  const THIRD = 1200 * Math.log2(5 / 4);          // pure major third, 386.31 c
  const MINOR = 1200 * Math.log2(6 / 5);          // pure minor third, 315.64 c

  /* names: index 0..11 from C upwards; the circle of fifths in the order the narrowing is given */
  const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];
  const CIRCLE = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];          // C G D A E B F♯ C♯ G♯ E♭ B♭ F
  const FIFTHS = CIRCLE.map((n, i) => [n, CIRCLE[(i + 1) % 12]]); // C–G … F–C

  /* d: twelve narrowings in cents for C–G, G–D, D–A, A–E, E–B, B–F♯, F♯–C♯, C♯–G♯, G♯–E♭, E♭–B♭, B♭–F, F–C
     (negative = wider than pure). For the meantones and Pythagorean the G♯–E♭ entry is left null:
     it takes whatever is left over (the wolf). */
  const q = (x, n) => Array(n).fill(x);
  const meantone = c => [...q(c, 8), null, ...q(c, 3)];
  const frac = (k, name) => ({k, name});
  const T = [
    {id: 'pyth', group: 'pure', name: 'Pythagorean', who: 'medieval theory', d: meantone(0),
     temp: '11 pure fifths; the wolf G♯–E♭ is a Pythagorean comma narrow',
     text: [
      'The tuning of medieval music theory, built from the two simplest ratios: the octave (2:1) and the fifth (3:2). Twelve pure fifths do not quite close the circle – they overshoot seven octaves by the Pythagorean comma (about 23.5 cents) – so one fifth, here G♯–E♭, has to swallow the whole comma and becomes a howling “wolf”.',
      'Fifths and fourths are perfectly pure and melodic whole tones are large (9:8, 203.9 c), so melodies sound bright and leading semitones are small and tense (90.2 c). The major third, two whole tones (81:64, 407.8 c), is more than a fifth of a semitone wider than pure: in medieval polyphony thirds and sixths were imperfect consonances that had to move on, and Pythagorean tuning makes you hear why.',
      'Note that some of the thirds are almost pure: B–E♭, F♯–B♭, C♯–F and G♯–C (which are really diminished fourths) come out at 384.4 c, only 2 cents narrow – a curiosity used by some 15th-century keyboard players.'],
     how: ['Tune a′ (or c′) from your pitch source.', 'Tune every fifth and fourth beatless, going round the circle from E♭ to G♯: E♭–B♭–F–C–G–D–A–E–B–F♯–C♯–G♯.', 'Leave the wolf G♯–E♭ as it falls: it will beat fast and sound rough.']},

    {id: 'just', group: 'pure', name: 'Just intonation (C major)', who: 'Ptolemy, Zarlino 1558', just: [1, 16 / 15, 9 / 8, 6 / 5, 5 / 4, 4 / 3, 45 / 32, 3 / 2, 8 / 5, 5 / 3, 9 / 5, 15 / 8],
     temp: 'pure 3:2 fifths and 5:4 thirds in C; D–A is a syntonic comma narrow',
     text: [
      'Pure fifths (3:2) and pure major thirds (5:4) at the same time. Gioseffo Zarlino (Le istitutioni harmoniche, 1558) made this “syntonic diatonic” of Ptolemy the theoretical basis of the perfect consonances; singers and string players move towards it naturally when they hold a chord.',
      'The price: there are two sizes of whole tone (9:8 = 203.9 c and 10:9 = 182.4 c), and on a fixed instrument it works in only one key. Here, tuned on C, the triads C, F and G major and A and E minor are pure, but the fifth D–A is a syntonic comma (21.5 c) narrow, so D minor is unusable. That is why keyboards needed temperaments.',
      'Use it as the ideal against which every temperament on this page is measured: the tables show how far each third and fifth departs from these pure sizes.'],
     how: ['Tune c′.', 'Tune G and F as pure fifths/fourths of C, then D as a pure fifth above G.', 'Tune E, A and B as pure major thirds above C, F and G (beatless).', 'Tune the remaining notes as pure thirds or fifths of these (E♭ = pure minor third over C, B♭ = 9:5, F♯ = pure third over D, C♯ = 16:15, G♯/A♭ = 8:5).']},

    {id: 'm14', group: 'mean', name: '¼-comma meantone', who: 'Pietro Aron 1523, Zarlino, Salinas 1577', d: meantone(SC / 4),
     temp: '11 fifths ¼ syntonic comma narrow (696.6 c); wolf G♯–E♭ wide (737.6 c)',
     text: [
      'The tuning of the Renaissance keyboard. Each fifth is narrowed by a quarter of the syntonic comma, so that four fifths (C–G–D–A–E) land exactly on a pure major third C–E. Eight major thirds are pure; the whole tone lies exactly in the middle of the third – hence “mean tone”. Pietro Aron described a temperament of this kind in his Toscanello (1523); Francisco de Salinas (De musica, 1577) gave the exact quarter-comma.',
      'Chords in the keys with few accidentals glow; the colour of the music depends on the key. But the sharps are low and the flats high: G♯ is not A♭, and the diatonic semitone (117.1 c) is much larger than the chromatic one (76.0 c). The circle does not close – the leftover fifth G♯–E♭ is the wolf, and the four “thirds” B–E♭, F♯–B♭, C♯–F and G♯–C are unusable diminished fourths (427 c). Some instruments had split keys (G♯/A♭, E♭/D♯) to escape this.',
      'Meantone ruled organs and harpsichords from the early 16th century and remained in many organs well into the 18th and even 19th centuries.'],
     how: ['Tune c′ and e′ as a pure, beatless major third.', 'Tune the fifths C–G, G–D, D–A, A–E all equally narrow, so that E arrives exactly at the e you already have (use fourths and octaves to stay in the middle octave). Check that the four fifths beat at a similar, slow rate.', 'Continue with equally narrow fifths E–B, B–F♯, F♯–C♯, C♯–G♯, and down from C: C–F, F–B♭, B♭–E♭.', 'Check: every major third C–E, D–F♯, E–G♯, F–A, G–B, A–C♯, B♭–D, E♭–G is pure.']},

    {id: 'm13', group: 'mean', name: '⅓-comma meantone', who: 'Francisco de Salinas 1577', d: meantone(SC / 3),
     temp: '11 fifths ⅓ syntonic comma narrow (694.8 c)',
     text: [
      'Each fifth is narrowed by a third of the syntonic comma, which makes the minor thirds (6:5) pure and the major thirds slightly narrow. Salinas described it in De musica (1577) as the tuning he heard as best for the viol and the keyboard.',
      'Its fifths are rather narrow (7.2 c), but its intervals come very close to 19-tone equal temperament, so it suits music full of minor triads and chromatic semitones.'],
     how: ['Tune c′ and e♭′ as a pure minor third, then a′ as a pure minor third below c″ (use octaves).', 'Divide the remaining distance with equally narrow fifths, as in quarter-comma meantone but narrower; check that all minor thirds C–E♭, D–F, E–G, F–A♭ … are beatless.']},

    {id: 'm27', group: 'mean', name: '²⁄₇-comma meantone', who: 'Gioseffo Zarlino 1558', d: meantone(SC * 2 / 7),
     temp: '11 fifths ²⁄₇ syntonic comma narrow (695.8 c)',
     text: [
      'Zarlino’s temperament from Le istitutioni harmoniche (1558): the fifth is narrowed by 2/7 of the comma, which makes major and minor thirds equally impure (each 1/7 comma narrow). A theorist’s compromise between quarter- and third-comma meantone.'],
     how: ['Tune as quarter-comma meantone, but with the fifths very slightly narrower, so that the major thirds beat slowly narrow and the minor thirds beat at the same slow rate.']},

    {id: 'm15', group: 'mean', name: '⅕-comma meantone', who: 'a milder meantone', d: meantone(SC / 5),
     temp: '11 fifths ⅕ syntonic comma narrow (697.6 c)',
     text: [
      'A gentler meantone: the fifths are closer to pure, the major thirds slightly wide (4.3 c), the wolf less savage. It keeps much of the colour of quarter-comma meantone while making remote keys a little more usable.'],
     how: ['Tune as quarter-comma meantone, but leave the fifths slightly less narrow: the thirds C–E, F–A and G–B should beat slowly wide.']},

    {id: 'm16', group: 'mean', name: '⅙-comma meantone', who: 'Gottfried Silbermann (after Sorge)', d: meantone(SC / 6),
     temp: '11 fifths ⅙ syntonic comma narrow (698.4 c)',
     text: [
      'The meantone associated with the organs of Gottfried Silbermann (1683–1753), according to his critic Georg Andreas Sorge. The fifths are only 3.6 c narrow, the thirds 7.2 c wide; the diatonic and chromatic semitones (108.1 c and 88.3 c) are less unequal than in quarter-comma.',
      'Very close to 55-tone equal division of the octave, which Telemann and the singer-theorist Pier Francesco Tosi described as the system of nine “commas” to the whole tone.'],
     how: ['Tune as quarter-comma meantone, but make the fifths only slightly narrow; the major thirds of the common keys beat moderately wide.']},

    {id: 'werck3', group: 'well', name: 'Werckmeister III', who: 'Andreas Werckmeister 1691', d: [PC / 4, PC / 4, PC / 4, 0, 0, PC / 4, 0, 0, 0, 0, 0, 0],
     temp: 'C–G, G–D, D–A and B–F♯ ¼ Pythagorean comma narrow; all other fifths pure',
     text: [
      'From Andreas Werckmeister’s Musicalische Temperatur (1691), the first of his “good” temperaments (numbered III because he counted the pure Pythagorean and meantone tunings first). Four fifths share the Pythagorean comma, the other eight are pure, so the circle closes and every key can be played.',
      'The keys are not alike: C major and the keys near it have rather good thirds (C–E 390.2 c), while the remote keys (F♯, D♭, A♭ major) have Pythagorean thirds of 407.8 c. Bach’s generation heard this as the differing character of keys.'],
     how: ['Tune c′.', 'Tune C–G, G–D and D–A each a quarter comma narrow (they beat a little faster than in equal temperament).', 'Tune A–E, E–B pure; then B–F♯ a quarter comma narrow.', 'Tune all remaining fifths pure: F♯–C♯–G♯–E♭ and C–F–B♭–E♭. G♯–E♭ must now come out pure as a check.']},

    {id: 'werck4', group: 'well', name: 'Werckmeister IV', who: 'Andreas Werckmeister 1691', d: [PC / 3, 0, PC / 3, 0, PC / 3, 0, PC / 3, 0, -PC / 3, -PC / 3, PC / 3, 0],
     temp: 'five fifths ⅓ Pythagorean comma narrow, G♯–E♭ and E♭–B♭ ⅓ comma wide',
     text: [
      'Werckmeister’s second temperament, built with thirds of the Pythagorean comma: five fifths narrow by a third of a comma, two fifths (G♯–E♭ and E♭–B♭) a third of a comma wide. An irregular, more strongly coloured system than Werckmeister III.'],
     how: ['Tune C–G, D–A, E–B, F♯–C♯ and B♭–F each a third of a comma narrow, G–D, A–E, B–F♯, C♯–G♯ and F–C pure.', 'Tune G♯–E♭ and E♭–B♭ a third of a comma wide (beating, but on the wide side).']},

    {id: 'werck5', group: 'well', name: 'Werckmeister V', who: 'Andreas Werckmeister 1691', d: [0, 0, PC / 4, PC / 4, 0, 0, PC / 4, PC / 4, -PC / 4, 0, 0, PC / 4],
     temp: 'D–A, A–E, F♯–C♯, C♯–G♯, F–C ¼ comma narrow; G♯–E♭ ¼ comma wide',
     text: [
      'Werckmeister’s third temperament: five fifths a quarter comma narrow, one (G♯–E♭) a quarter comma wide, the rest pure. Several notes fall on round numbers of cents (E♭ 300, F♯ 600, A 900 above C).'],
     how: ['Tune C–G and G–D pure, D–A and A–E a quarter comma narrow, E–B and B–F♯ pure.', 'Tune F♯–C♯ and C♯–G♯ a quarter comma narrow; F–C a quarter comma narrow, B♭–F and E♭–B♭ pure; G♯–E♭ comes out a quarter comma wide.']},

    {id: 'kirn2', group: 'well', name: 'Kirnberger II', who: 'Johann Philipp Kirnberger 1771', d: [0, 0, SC / 2, SC / 2, 0, 0, SCH, 0, 0, 0, 0, 0],
     temp: 'D–A and A–E ½ syntonic comma narrow, F♯–C♯ a schisma narrow, all others pure',
     text: [
      'From Kirnberger’s Die Kunst des reinen Satzes (1771). The thinking of a composer rather than a tuner: a pure third C–E (made by halving the comma between D–A and A–E) and as many pure fifths as possible. The two very narrow fifths make D major and A major rather rough.'],
     how: ['Tune c′ and e′ as a pure third, and g′, d′ as pure fifths from C.', 'Split the distance D–E between D–A and A–E: both fifths equally narrow (half a comma each – they beat clearly).', 'Tune all other fifths pure, except F♯–C♯, which is a barely audible schisma narrow (you can treat it as pure).']},

    {id: 'kirn3', group: 'well', name: 'Kirnberger III', who: 'Johann Philipp Kirnberger c. 1779', d: [SC / 4, SC / 4, SC / 4, SC / 4, 0, 0, SCH, 0, 0, 0, 0, 0],
     temp: 'C–G, G–D, D–A, A–E ¼ syntonic comma narrow, F♯–C♯ a schisma narrow',
     text: [
      'Kirnberger’s improved version: the comma is now shared by four fifths, exactly as in quarter-comma meantone, so C major has a pure third and meantone-like sweetness, while the remaining fifths are pure and the circle closes. Smoother than Kirnberger II, and much used today for Baroque organ and harpsichord.'],
     how: ['Tune c′–e′ as a pure third.', 'Tune C–G–D–A–E as four equally narrow fifths that end on the pure e (as in quarter-comma meantone).', 'Tune all other fifths pure (E–B–F♯ and C–F–B♭–E♭–A♭); F♯–C♯ is a schisma narrow, practically pure.']},

    {id: 'vallotti', group: 'well', name: 'Vallotti', who: 'Francesco Antonio Vallotti, Padua (pub. 1779)', d: [PC / 6, PC / 6, PC / 6, PC / 6, PC / 6, 0, 0, 0, 0, 0, 0, PC / 6],
     temp: 'F–C–G–D–A–E–B six fifths ⅙ Pythagorean comma narrow, six fifths pure',
     text: [
      'The temperament of Francesco Antonio Vallotti, maestro di cappella at the Basilica del Santo in Padua (also called Tartini–Vallotti). The six “natural” fifths from F to B are each a sixth of a comma narrow, the six chromatic ones pure. The result is symmetrical and gentle: the keys move smoothly from sweet (C, F, G) to brighter and more Pythagorean (F♯, D♭).',
      'One of the most widely used historical temperaments today, a good choice for music from the 17th to the early 19th century.'],
     how: ['Tune a′, then the fifths F–C–G–D–A–E–B each a sixth comma narrow (between the beating of equal temperament and pure).', 'Tune the fifths B–F♯–C♯–G♯ and F–B♭–E♭–A♭ pure. The pure G♯/A♭ should now meet without beating.']},

    {id: 'young', group: 'well', name: 'Young II', who: 'Thomas Young 1800', d: [PC / 6, PC / 6, PC / 6, PC / 6, PC / 6, PC / 6, 0, 0, 0, 0, 0, 0],
     temp: 'C–G–D–A–E–B–F♯ six fifths ⅙ comma narrow, six fifths pure',
     text: [
      'Proposed by the physicist Thomas Young in 1800. The same pattern as Vallotti, moved one fifth up (the tempered fifths run from C to F♯), which makes the sharp keys a little sweeter and the flat keys a little brighter.'],
     how: ['Tune the fifths C–G–D–A–E–B–F♯ each a sixth comma narrow.', 'Tune F♯–C♯–G♯–E♭–B♭–F–C pure.']},

    {id: 'neid', group: 'well', name: 'Neidhardt, “große Stadt”', who: 'Johann Georg Neidhardt 1724', d: [PC / 6, PC / 6, PC / 6, PC / 12, 0, PC / 12, PC / 12, PC / 12, 0, PC / 12, PC / 12, 0],
     temp: 'C–G, G–D, D–A ⅙ comma; six fifths 1⁄12 comma; E–B, G♯–E♭, F–C pure',
     text: [
      'Johann Georg Neidhardt (Sectio canonis harmonici, Königsberg 1724) proposed different temperaments for different places: for a village, a small town, a large town (“große Stadt”) and a court – the larger the place, the closer to equal temperament, because more remote keys would be played.',
      'This is the temperament for a large town: three fifths a sixth of a comma narrow, six fifths as in equal temperament (a twelfth of a comma), three pure. Very close to equal temperament, with a gentle preference for the common keys.'],
     how: ['Tune C–G, G–D and D–A each a sixth of a comma narrow.', 'Tune A–E, B–F♯, F♯–C♯, C♯–G♯, E♭–B♭ and B♭–F as equal-tempered fifths (a twelfth of a comma narrow).', 'Tune E–B, G♯–E♭ and F–C pure.']},

    {id: 'kellner', group: 'well', name: 'Kellner', who: 'Herbert Anton Kellner 1977', d: [PC / 5, PC / 5, PC / 5, PC / 5, 0, PC / 5, 0, 0, 0, 0, 0, 0],
     temp: 'C–G–D–A–E and B–F♯ ⅕ Pythagorean comma narrow, seven fifths pure',
     text: [
      'A modern reconstruction of a temperament for Bach, put forward by Herbert Anton Kellner in 1977 and derived from number symbolism (Bach’s seal). Like Werckmeister III, but the comma is spread over five fifths, which gives smoother keys.'],
     how: ['Tune C–G, G–D, D–A, A–E and B–F♯ each a fifth of a comma narrow.', 'Tune all other fifths pure (E–B, F♯–C♯–G♯–E♭–B♭–F–C).']},

    {id: 'lehman', group: 'well', name: 'Lehman (Bach)', who: 'Bradley Lehman 2005', d: [PC / 6, PC / 6, PC / 6, PC / 6, 0, 0, 0, PC / 12, PC / 12, PC / 12, -PC / 12, PC / 6],
     temp: 'F–C–G–D–A–E ⅙ comma narrow; E–B–F♯–C♯ pure; C♯–G♯–E♭–B♭ 1⁄12 narrow; B♭–F 1⁄12 wide',
     text: [
      'Bradley Lehman’s reading (Early Music, 2005) of the looped drawing on the title page of Bach’s Well-Tempered Clavier (1722) as a tuning diagram. Five sixth-comma fifths, three pure, three twelfth-comma, and one slightly wide fifth B♭–F. A widely discussed and debated hypothesis; musically a very smooth well temperament.'],
     how: ['Tune F–C–G–D–A–E each a sixth comma narrow.', 'Tune E–B, B–F♯ and F♯–C♯ pure.', 'Tune C♯–G♯, G♯–D♯ and D♯–A♯ each a twelfth comma narrow (as in equal temperament).', 'B♭–F comes out a twelfth comma wide: check that it beats slowly on the wide side.']},

    {id: 'equal', group: 'equal', name: 'Equal temperament', who: 'Zhu Zaiyu 1584, Simon Stevin c. 1605', d: q(PC / 12, 12),
     temp: 'all fifths 1⁄12 Pythagorean comma narrow (700 c)',
     text: [
      'Twelve identical semitones of 100 cents: every fifth is a twelfth of the Pythagorean comma narrow (2 c), every major third is 13.7 c wide. Calculated exactly by Zhu Zaiyu in China (1584) and Simon Stevin in the Netherlands (around 1605). Lutes and viols, with frets running straight across all strings, had used nearly equal semitones since the 16th century – Vincenzo Galilei recommended the ratio 18:17.',
      'All keys sound the same; nothing is pure except the octave. It became the norm for keyboards in the 19th century and is the reference for everything on this page.'],
     how: ['Tune a′.', 'Tune the twelve fifths each very slightly narrow, so that they all beat at a slow, evenly increasing rate (about once per second near the middle of the keyboard).', 'Check with the major thirds and sixths: as you go up chromatically, their beats must speed up smoothly, with no jumps.']},
  ];
  const GROUPS = {pure: 'Pure tunings', mean: 'Meantone', well: 'Well temperaments', equal: 'Equal temperament'};

  /* cents of the twelve notes above C (0 … 1200), from the chain of fifths */
  function cents(t) {
    if (t.just) return t.just.map(r => 1200 * Math.log2(r));
    const d = t.d.slice();
    const known = d.reduce((a, x) => a + (x === null ? 0 : x), 0);
    const iw = d.indexOf(null);
    if (iw >= 0) d[iw] = PC - known;        /* the wolf takes the rest */
    const c = Array(12).fill(0);
    let x = 0;
    for (let i = 0; i < 8; i++) { x += FIFTH - d[i]; c[CIRCLE[i + 1]] = ((x % 1200) + 1200) % 1200; }
    x = 0;
    for (let i = 11; i >= 9; i--) { x -= FIFTH - d[i]; c[CIRCLE[i]] = ((x % 1200) + 1200) % 1200; }
    return c;
  }
  const size = (c, a, b) => (((c[b] - c[a]) % 1200) + 1200) % 1200;   /* interval from note a up to note b */

  /* ---------- language: the page chrome in four languages, the explanations in English ---------- */
  const L = {
    de: {'Tuning systems': 'Stimmungssysteme', 'All exercises': 'Alle Übungen', 'Temperament': 'Stimmung', 'Compare with': 'Vergleichen mit', 'nothing': 'nichts',
      'Root': 'Grundton', 'Pitch of a′': 'Stimmton a′', 'Sound': 'Klang', 'Speed': 'Tempo', 'Major scale': 'Durtonleiter', 'Minor scale': 'Molltonleiter', 'Chromatic scale': 'Chromatische Tonleiter',
      'Major triad': 'Durdreiklang', 'Minor triad': 'Molldreiklang', 'Cadence I–IV–V–I': 'Kadenz I–IV–V–I', 'Drone for singing': 'Bordun zum Singen', 'Stop': 'Stopp',
      'Play': 'Spielen', 'Scales': 'Tonleitern', 'Chords': 'Akkorde', 'Sing': 'Singen', 'Keyboard': 'Klaviatur', 'Notes': 'Töne', 'cents above C': 'Cent über C', 'deviation from equal': 'Abweichung von gleichstufig',
      'Fifths': 'Quinten', 'Major thirds': 'Große Terzen', 'Minor thirds': 'Kleine Terzen', 'size': 'Größe', 'from pure': 'von rein', 'beats/s': 'Schwebungen/s', 'How it works': 'Wie sie funktioniert', 'How to tune it': 'Wie man sie stimmt',
      'All temperaments compared': 'Alle Stimmungen im Vergleich', 'Deviation of each note from equal temperament, in cents (A = 0).': 'Abweichung jedes Tons von der gleichstufigen Stimmung, in Cent (A = 0).',
      'Major thirds on every note': 'Große Terzen auf jedem Ton', 'Each cell shows how much the major third above that note is wider than pure (in cents). White = pure; the darker, the wider.': 'Jede Zelle zeigt, um wie viel die große Terz über diesem Ton größer als rein ist (in Cent). Weiß = rein; je dunkler, desto größer.',
      'The commas': 'Die Kommata', 'Marchetto of Padua: the whole tone in five parts': 'Marchetto von Padua: der Ganzton in fünf Teilen',
      'Hear Marchetto’s sharp': 'Marchettos Kreuz hören', 'Light / dark': 'Hell / dunkel', 'Beat rates in the octave f–e′ with a′ as chosen above.': 'Schwebungen in der Oktave f–e′ mit dem oben gewählten a′.',
      'Tap a key to hear the note in this temperament.': 'Tippen Sie auf eine Taste, um den Ton in dieser Stimmung zu hören.', 'Pythagorean': 'Pythagoreisch', 'Equal temperament': 'Gleichstufige Stimmung',
      'Pure tunings': 'Reine Stimmungen', 'Meantone': 'Mitteltönig', 'Well temperaments': 'Wohltemperierte Stimmungen', 'The explanations are in English for now.': 'Die Erläuterungen sind vorerst auf Englisch.',
      'wolf': 'Wolf', 'pure': 'rein', 'narrow': 'eng', 'wide': 'weit', 'A/B: play the same with the comparison': 'A/B: dasselbe mit der Vergleichsstimmung spielen', 'Hold': 'Halten'},
    fr: {'Tuning systems': 'Systèmes d’accord', 'All exercises': 'Tous les exercices', 'Temperament': 'Tempérament', 'Compare with': 'Comparer avec', 'nothing': 'rien',
      'Root': 'Tonique', 'Pitch of a′': 'Diapason (la)', 'Sound': 'Son', 'Speed': 'Tempo', 'Major scale': 'Gamme majeure', 'Minor scale': 'Gamme mineure', 'Chromatic scale': 'Gamme chromatique',
      'Major triad': 'Accord majeur', 'Minor triad': 'Accord mineur', 'Cadence I–IV–V–I': 'Cadence I–IV–V–I', 'Drone for singing': 'Bourdon pour chanter', 'Stop': 'Arrêt',
      'Play': 'Jouer', 'Scales': 'Gammes', 'Chords': 'Accords', 'Sing': 'Chanter', 'Keyboard': 'Clavier', 'Notes': 'Notes', 'cents above C': 'cents au-dessus de do', 'deviation from equal': 'écart du tempérament égal',
      'Fifths': 'Quintes', 'Major thirds': 'Tierces majeures', 'Minor thirds': 'Tierces mineures', 'size': 'taille', 'from pure': 'par rapport au pur', 'beats/s': 'battements/s', 'How it works': 'Principe', 'How to tune it': 'Comment l’accorder',
      'All temperaments compared': 'Tous les tempéraments comparés', 'Deviation of each note from equal temperament, in cents (A = 0).': 'Écart de chaque note par rapport au tempérament égal, en cents (la = 0).',
      'Major thirds on every note': 'Tierces majeures sur chaque note', 'Each cell shows how much the major third above that note is wider than pure (in cents). White = pure; the darker, the wider.': 'Chaque case montre de combien la tierce majeure au-dessus de cette note est plus large que pure (en cents). Blanc = pure ; plus c’est foncé, plus elle est large.',
      'The commas': 'Les commas', 'Marchetto of Padua: the whole tone in five parts': 'Marchetto de Padoue : le ton divisé en cinq parties',
      'Hear Marchetto’s sharp': 'Entendre le dièse de Marchetto', 'Light / dark': 'Clair / sombre', 'Beat rates in the octave f–e′ with a′ as chosen above.': 'Battements dans l’octave fa–mi′ avec le la choisi ci-dessus.',
      'Tap a key to hear the note in this temperament.': 'Touchez une touche pour entendre la note dans ce tempérament.', 'Pythagorean': 'Pythagoricien', 'Equal temperament': 'Tempérament égal',
      'Pure tunings': 'Accords purs', 'Meantone': 'Mésotonique', 'Well temperaments': 'Tempéraments inégaux', 'The explanations are in English for now.': 'Les explications sont pour l’instant en anglais.',
      'wolf': 'loup', 'pure': 'pure', 'narrow': 'étroite', 'wide': 'large', 'A/B: play the same with the comparison': 'A/B : jouer la même chose avec la comparaison', 'Hold': 'Tenir'},
    cs: {'Tuning systems': 'Ladicí systémy', 'All exercises': 'Všechna cvičení', 'Temperament': 'Ladění', 'Compare with': 'Porovnat s', 'nothing': 'nic',
      'Root': 'Základní tón', 'Pitch of a′': 'Ladička a′', 'Sound': 'Zvuk', 'Speed': 'Tempo', 'Major scale': 'Durová stupnice', 'Minor scale': 'Mollová stupnice', 'Chromatic scale': 'Chromatická stupnice',
      'Major triad': 'Durový kvintakord', 'Minor triad': 'Mollový kvintakord', 'Cadence I–IV–V–I': 'Kadence I–IV–V–I', 'Drone for singing': 'Prodleva ke zpěvu', 'Stop': 'Stop',
      'Play': 'Přehrát', 'Scales': 'Stupnice', 'Chords': 'Akordy', 'Sing': 'Zpívat', 'Keyboard': 'Klaviatura', 'Notes': 'Tóny', 'cents above C': 'centů nad C', 'deviation from equal': 'odchylka od rovnoměrného',
      'Fifths': 'Kvinty', 'Major thirds': 'Velké tercie', 'Minor thirds': 'Malé tercie', 'size': 'velikost', 'from pure': 'od čisté', 'beats/s': 'záznějů/s', 'How it works': 'Jak funguje', 'How to tune it': 'Jak ho naladit',
      'All temperaments compared': 'Všechna ladění v porovnání', 'Deviation of each note from equal temperament, in cents (A = 0).': 'Odchylka každého tónu od rovnoměrně temperovaného ladění v centech (A = 0).',
      'Major thirds on every note': 'Velké tercie na každém tónu', 'Each cell shows how much the major third above that note is wider than pure (in cents). White = pure; the darker, the wider.': 'Každé pole ukazuje, o kolik je velká tercie nad tímto tónem širší než čistá (v centech). Bílá = čistá; čím tmavší, tím širší.',
      'The commas': 'Kómata', 'Marchetto of Padua: the whole tone in five parts': 'Marchetto z Padovy: celý tón v pěti dílech',
      'Hear Marchetto’s sharp': 'Poslechnout Marchettův křížek', 'Light / dark': 'Světlý / tmavý', 'Beat rates in the octave f–e′ with a′ as chosen above.': 'Zázněje v oktávě f–e′ s výše zvoleným a′.',
      'Tap a key to hear the note in this temperament.': 'Klepněte na klávesu a uslyšíte tón v tomto ladění.', 'Pythagorean': 'Pythagorejské', 'Equal temperament': 'Rovnoměrně temperované ladění',
      'Pure tunings': 'Čistá ladění', 'Meantone': 'Středotónové', 'Well temperaments': 'Dobře temperovaná ladění', 'The explanations are in English for now.': 'Vysvětlení jsou zatím v angličtině.',
      'wolf': 'vlk', 'pure': 'čistá', 'narrow': 'úzká', 'wide': 'široká', 'A/B: play the same with the comparison': 'A/B: zahrát totéž ve srovnávacím ladění', 'Hold': 'Držet'}
  };
  let lang = 'en';
  try { lang = localStorage.getItem('lang') || (navigator.language || 'en').slice(0, 2); } catch (e) {}
  if (!['en', 'de', 'fr', 'cs'].includes(lang)) lang = 'en';
  const t = s => (lang !== 'en' && L[lang] && L[lang][s]) || s;

  /* ---------- sound ---------- */
  let ctx = null, out = null, live = [], timers = [];
  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
      out = ctx.createGain(); out.gain.value = .7; out.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const WAVES = {};
  function wave(name) {
    if (WAVES[name]) return WAVES[name];
    const N = 16, re = new Float32Array(N), im = new Float32Array(N);
    /* harmonics up to the 6th are what makes thirds and fifths beat audibly */
    const amp = {organ: [0, 1, .6, .42, .3, .22, .16, .1, .06], strings: [0, 1, .5, .33, .25, .2, .17, .14, .12, .1, .08], flute: [0, 1, .25, .12, .05, .03]}[name];
    for (let k = 1; k < N; k++) im[k] = amp[k] || 0;
    return (WAVES[name] = ac().createPeriodicWave(re, im));
  }
  function tone(f, t0, dur, vol) {
    const c = ac(), g = c.createGain(), o = c.createOscillator();
    o.setPeriodicWave(wave(S.timbre)); o.frequency.value = f;
    const v = (vol || .16), a = .04, r = .12;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + a);
    o.connect(g); g.connect(out); o.start(t0);
    if (isFinite(dur)) { g.gain.setValueAtTime(v, t0 + Math.max(a, dur - r)); g.gain.linearRampToValueAtTime(0, t0 + dur); o.stop(t0 + dur + .05); }
    const n = {o, g}; live.push(n); return n;
  }
  function stopAll() {
    if (!ctx) return;
    const now = ctx.currentTime;
    live.forEach(n => { try { n.g.gain.cancelScheduledValues(now); n.g.gain.setValueAtTime(n.g.gain.value, now); n.g.gain.linearRampToValueAtTime(0, now + .06); n.o.stop(now + .1); } catch (e) {} });
    live = []; timers.forEach(clearTimeout); timers = [];
    document.querySelectorAll('.k.on').forEach(k => k.classList.remove('on'));
  }

  /* ---------- state ---------- */
  const S = {id: 'm14', cmp: 'equal', root: 0, a4: 440, timbre: 'organ', speed: 1, hold: false};
  try { Object.assign(S, JSON.parse(localStorage.getItem('tuning') || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem('tuning', JSON.stringify(S)); } catch (e) {} };
  const byId = id => T.find(x => x.id === id) || T[0];

  /* frequency of note n (0..11 above C) in octave o (4 = the octave of c′), with a′ fixed */
  function freq(tm, n, o) {
    const c = cents(tm);
    const ofs = c[n] - c[9];                        /* cents above (or below) A within the same octave */
    return S.a4 * Math.pow(2, (o - 4) + ofs / 1200);
  }

  /* ---------- what to play ---------- */
  const MAJ = [0, 2, 4, 5, 7, 9, 11, 12], MIN = [0, 2, 3, 5, 7, 8, 10, 12];
  function seq(kind) {
    const r = S.root, step = .55 / S.speed, o0 = r >= 7 ? 3 : 4;   /* keep everything around the middle of the voice */
    const note = k => ({n: (r + k) % 12, o: o0 + Math.floor((r + k) / 12)});
    if (kind === 'major' || kind === 'minor' || kind === 'chrom') {
      const st = kind === 'major' ? MAJ : kind === 'minor' ? MIN : [...Array(13).keys()];
      const up = st.map(note), down = up.slice(0, -1).reverse();
      return [...up, ...down].map((x, i) => ({at: i * step, dur: step * .95, ns: [x]}));
    }
    if (kind === 'majT' || kind === 'minT') {
      const ch = [0, kind === 'majT' ? 4 : 3, 7, 12].map(note);
      return [...ch.map((x, i) => ({at: i * step, dur: (4 - i) * step + 2.6, ns: [x]}))];
    }
    if (kind === 'cad') {
      const lo = k => ({n: ((r + k) % 12 + 12) % 12, o: o0 - 1 + Math.floor((r + k) / 12)});
      const ch = [[lo(0), note(4), note(7), note(12)], [lo(5), note(5), note(9), note(12)], [lo(7), note(2), note(7), note(11)], [lo(0), note(4), note(7), note(12)]];
      const L = 1.6 / S.speed;
      return ch.map((ns, i) => ({at: i * L, dur: L * (i === 3 ? 2 : .97), ns}));
    }
    if (kind === 'drone') return [{at: 0, dur: Infinity, ns: [{n: r, o: o0 - 1}, {n: (r + 7) % 12, o: o0 - 1 + Math.floor((r + 7) / 12)}]}];
    return [];
  }
  function play(kind, which) {
    stopAll();
    const tm = byId(which === 'B' && S.cmp !== 'none' ? S.cmp : S.id);
    const c = ac(), t0 = c.currentTime + .05;
    seq(kind).forEach(ev => ev.ns.forEach(x => {
      const dur = S.hold && kind !== 'drone' && isFinite(ev.dur) ? ev.dur * 2.5 : ev.dur;
      tone(freq(tm, x.n, x.o), t0 + ev.at, dur, kind === 'drone' ? .13 : ev.ns.length > 1 ? .11 : .16);
      timers.push(setTimeout(() => lightKey(x.n, true), ev.at * 1000 + 50));
      if (isFinite(dur)) timers.push(setTimeout(() => lightKey(x.n, false), (ev.at + dur) * 1000));
    }));
    $('#now').textContent = tm.name;
  }
  function lightKey(n, on) { const k = document.querySelector('.k[data-n="' + n + '"]'); if (k) k.classList.toggle('on', on); }

  /* ---------- drawing ---------- */
  const $ = s => document.querySelector(s);
  const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
  const sgn = x => (x > 0.05 ? '+' : x < -0.05 ? '−' : '±') + f1(Math.abs(x));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function select(id, list, cur, withNone) {
    const groups = {};
    T.forEach(x => (groups[x.group] = groups[x.group] || []).push(x));
    return `<select id="${id}">` + (withNone ? `<option value="none"${cur === 'none' ? ' selected' : ''}>${t('nothing')}</option>` : '') +
      Object.keys(GROUPS).map(g => `<optgroup label="${esc(t(GROUPS[g]))}">` + groups[g].map(x => `<option value="${x.id}"${x.id === cur ? ' selected' : ''}>${esc(x.name)}</option>`).join('') + '</optgroup>').join('') + '</select>';
  }

  /* the circle of fifths: each arc coloured by how far the fifth is from pure */
  function circleSVG(tm) {
    const c = cents(tm), R = 118, cx = 160, cy = 150;
    let o = `<svg viewBox="0 0 320 300" class="circ" role="img" aria-label="Circle of fifths">`;
    FIFTHS.forEach(([a, b], i) => {
      const dev = size(c, a, b) - FIFTH;      /* negative = narrow */
      const a0 = -Math.PI / 2 + i * Math.PI / 6 + .13, a1 = a0 + Math.PI / 6 - .26;
      const w = Math.min(12, 2 + Math.abs(dev) * 0.9);
      const col = Math.abs(dev) < .05 ? 'var(--line-strong)' : dev < 0 ? 'var(--accent)' : 'var(--blue)';
      o += `<path d="M${(cx + R * Math.cos(a0)).toFixed(1)} ${(cy + R * Math.sin(a0)).toFixed(1)} A${R} ${R} 0 0 1 ${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)}" fill="none" stroke="${col}" stroke-width="${w.toFixed(1)}" stroke-linecap="round"><title>${NAMES[a]}–${NAMES[b]}: ${f1(size(c, a, b))} c (${sgn(dev)})</title></path>`;
      const am = -Math.PI / 2 + (i + .5) * Math.PI / 6, rl = R + 24;
      if (Math.abs(dev) >= .05) o += `<text class="dv" x="${(cx + rl * Math.cos(am)).toFixed(1)}" y="${(cy + rl * Math.sin(am) + 4).toFixed(1)}" text-anchor="middle">${sgn(dev)}</text>`;
    });
    CIRCLE.forEach((n, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 6, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      o += `<g class="cn" data-n="${n}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15"/><text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle">${NAMES[n]}</text></g>`;
    });
    o += `<text class="mid" x="${cx}" y="${cy - 4}" text-anchor="middle">${esc(t('Fifths'))}</text><text class="mid2" x="${cx}" y="${cy + 16}" text-anchor="middle">${esc(t('narrow'))} · <tspan class="wd">${esc(t('wide'))}</tspan></text>`;
    return o + '</svg>';
  }

  function keyboard(tm) {
    const c = cents(tm), cmp = S.cmp !== 'none' ? cents(byId(S.cmp)) : null;
    const white = [0, 2, 4, 5, 7, 9, 11], black = {1: 1, 3: 2, 6: 4, 8: 5, 10: 6};
    let o = '<div class="kb" role="group" aria-label="Keyboard">';
    white.forEach(n => { o += `<button type="button" class="k w" data-n="${n}"><span>${NAMES[n]}</span><small>${sgn(devET(c, n))}</small></button>`; });
    Object.entries(black).forEach(([n, pos]) => { o += `<button type="button" class="k b" data-n="${n}" style="left:calc(${pos} * (100% / 7) - 3.2%)"><span>${NAMES[n]}</span></button>`; });
    return o + '</div>';
  }
  /* deviation of each note from equal temperament with A fixed */
  const devET = (c, n) => (c[n] - c[9]) - (n - 9) * 100;

  function beats(f_lo, f_hi, p, qq) { return Math.abs(p * f_lo - qq * f_hi); }   /* interval p:q (p > q): the p-th partial of the lower and q-th of the upper note meet */
  function tables(tm) {
    const c = cents(tm);
    /* frequencies in the bearing octave f (F3) … e′ (E4) */
    const fb = n => freq(tm, n, n >= 5 ? 3 : 4);
    let h = `<div class="tbls"><div class="tb"><h3>${esc(t('Notes'))}</h3><table><thead><tr><th></th><th>${esc(t('cents above C'))}</th><th>${esc(t('deviation from equal'))}</th></tr></thead><tbody>`;
    for (let n = 0; n < 12; n++) h += `<tr><th>${NAMES[n]}</th><td>${(c[n]).toFixed(1)}</td><td class="${Math.abs(devET(c, n)) < .05 ? 'z' : ''}">${sgn(devET(c, n))}</td></tr>`;
    h += '</tbody></table></div>';
    h += `<div class="tb"><h3>${esc(t('Fifths'))}</h3><table><thead><tr><th></th><th>${esc(t('size'))}</th><th>${esc(t('from pure'))}</th><th>${esc(t('beats/s'))}</th></tr></thead><tbody>`;
    FIFTHS.forEach(([a, b]) => {
      const s = size(c, a, b), dev = s - FIFTH;
      /* in the bearing octave: a fifth up if it stays below f′, otherwise the fourth down */
      const fa = fb(a), fbb = fb(b) > fa ? fb(b) : fb(b) * 2;
      const bt = fbb > freq(tm, 5, 4) ? beats(fbb / 2, fa, 4, 3) : beats(fa, fbb, 3, 2);   /* above f′: tune the fourth down instead */
      const cls = Math.abs(dev) < .05 ? 'z' : Math.abs(dev) > 12 ? 'wolf' : '';
      h += `<tr class="${cls}"><th>${NAMES[a]}–${NAMES[b]}</th><td>${f1(s)}</td><td>${sgn(dev)}${cls === 'wolf' ? ' · ' + esc(t('wolf')) : ''}</td><td>${Math.abs(dev) < .05 ? '0' : bt.toFixed(2)}</td></tr>`;
    });
    h += '</tbody></table></div>';
    h += `<div class="tb"><h3>${esc(t('Major thirds'))}</h3><table><thead><tr><th></th><th>${esc(t('size'))}</th><th>${esc(t('from pure'))}</th><th>${esc(t('beats/s'))}</th></tr></thead><tbody>`;
    for (let a = 0; a < 12; a++) {
      const b = (a + 4) % 12, s = size(c, a, b), dev = s - THIRD;
      const fa = fb(a), fbb = fb(b) > fa ? fb(b) : fb(b) * 2;
      const bt = beats(fa, fbb, 5, 4);
      const cls = Math.abs(dev) < .05 ? 'z' : dev > 30 ? 'wolf' : '';
      h += `<tr class="${cls}"><th>${NAMES[a]}–${NAMES[b]}</th><td>${f1(s)}</td><td>${sgn(dev)}</td><td>${Math.abs(dev) < .05 ? '0' : bt.toFixed(2)}</td></tr>`;
    }
    h += '</tbody></table></div>';
    h += `<div class="tb"><h3>${esc(t('Minor thirds'))}</h3><table><thead><tr><th></th><th>${esc(t('size'))}</th><th>${esc(t('from pure'))}</th></tr></thead><tbody>`;
    for (let a = 0; a < 12; a++) {
      const b = (a + 3) % 12, s = size(c, a, b), dev = s - MINOR;
      h += `<tr class="${Math.abs(dev) < .05 ? 'z' : Math.abs(dev) > 30 ? 'wolf' : ''}"><th>${NAMES[a]}–${NAMES[b]}</th><td>${f1(s)}</td><td>${sgn(dev)}</td></tr>`;
    }
    h += `</tbody></table></div></div><p class="note">${esc(t('Beat rates in the octave f–e′ with a′ as chosen above.'))} ${esc(S.a4)} Hz.</p>`;
    return h;
  }

  function compareTable() {
    let h = `<div class="scroll"><table class="cmp"><thead><tr><th></th>${NAMES.map(n => `<th>${n}</th>`).join('')}</tr></thead><tbody>`;
    T.forEach(tm => {
      const c = cents(tm);
      h += `<tr${tm.id === S.id ? ' class="cur"' : ''}><th><button type="button" class="pick" data-id="${tm.id}">${esc(tm.name)}</button></th>` +
        NAMES.map((_, n) => { const d = devET(c, n); return `<td style="--v:${Math.min(1, Math.abs(d) / 20).toFixed(2)}" class="${d < -0.05 ? 'lo' : d > 0.05 ? 'hi' : ''}">${Math.abs(d) < .05 ? '0' : (d > 0 ? '+' : '−') + Math.abs(d).toFixed(1)}</td>`; }).join('') + '</tr>';
    });
    h += '</tbody></table></div>';
    h += `<h3 class="sub">${esc(t('Major thirds on every note'))}</h3><p class="note">${esc(t('Each cell shows how much the major third above that note is wider than pure (in cents). White = pure; the darker, the wider.'))}</p>`;
    h += `<div class="scroll"><table class="cmp heat"><thead><tr><th></th>${NAMES.map(n => `<th>${n}</th>`).join('')}</tr></thead><tbody>`;
    T.forEach(tm => {
      const c = cents(tm);
      h += `<tr${tm.id === S.id ? ' class="cur"' : ''}><th><button type="button" class="pick" data-id="${tm.id}">${esc(tm.name)}</button></th>` +
        NAMES.map((_, n) => { const d = size(c, n, (n + 4) % 12) - THIRD; return `<td style="--h:${Math.max(0, Math.min(1, d / 42)).toFixed(3)}" class="${Math.abs(d) < .3 ? 'pure' : d > 30 ? 'wolf' : ''}">${Math.abs(d) < .05 ? '0' : (d > 0 ? '+' : '−') + Math.abs(d).toFixed(0)}</td>`; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  function detail(tm) {
    return `<div class="det"><p class="who">${esc(tm.who)} · ${esc(tm.temp)}</p>
      <h3>${esc(t('How it works'))}</h3>${tm.text.map(p => `<p>${esc(p)}</p>`).join('')}
      <h3>${esc(t('How to tune it'))}</h3><ol>${tm.how.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div>`;
  }

  function render() {
    const tm = byId(S.id);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(n => n.textContent = t(n.dataset.t));
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    $('#controls').innerHTML = `
      <label class="fld"><span>${esc(t('Temperament'))}</span>${select('sel', T, S.id)}</label>
      <label class="fld"><span>${esc(t('Compare with'))}</span>${select('cmpSel', T, S.cmp, true)}</label>
      <label class="fld"><span>${esc(t('Root'))}</span><select id="root">${NAMES.map((n, i) => `<option value="${i}"${i === S.root ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="fld"><span>${esc(t('Pitch of a′'))}</span><select id="a4">${[392, 415, 440, 442, 466].map(v => `<option value="${v}"${v === S.a4 ? ' selected' : ''}>${v} Hz</option>`).join('')}</select></label>
      <label class="fld"><span>${esc(t('Sound'))}</span><select id="tim">${['organ', 'strings', 'flute'].map(v => `<option value="${v}"${v === S.timbre ? ' selected' : ''}>${v === 'organ' ? 'Organ' : v === 'strings' ? 'Strings' : 'Flute'}</option>`).join('')}</select></label>
      <label class="fld"><span>${esc(t('Speed'))}</span><input id="spd" type="range" min=".5" max="2" step=".1" value="${S.speed}"></label>`;
    const row = (k, lab) => `<button type="button" class="btn" data-play="${k}">${esc(t(lab))}</button>`;
    $('#plays').innerHTML = `
      <div class="pg"><span class="pl">${esc(t('Scales'))}</span>${row('major', 'Major scale')}${row('minor', 'Minor scale')}${row('chrom', 'Chromatic scale')}</div>
      <div class="pg"><span class="pl">${esc(t('Chords'))}</span>${row('majT', 'Major triad')}${row('minT', 'Minor triad')}${row('cad', 'Cadence I–IV–V–I')}</div>
      <div class="pg"><span class="pl">${esc(t('Sing'))}</span>${row('drone', 'Drone for singing')}<label class="chk"><input id="hold" type="checkbox"${S.hold ? ' checked' : ''}> ${esc(t('Hold'))}</label>
        <button type="button" class="btn ghost" id="stop">${esc(t('Stop'))}</button></div>
      <div class="pg ab"${S.cmp === 'none' ? ' hidden' : ''}><span class="pl">A/B</span><span class="abn">${esc(t('A/B: play the same with the comparison'))}</span><button type="button" class="btn" id="playB">${esc(byId(S.cmp === 'none' ? S.id : S.cmp).name)}</button></div>
      <p class="now">▶ <span id="now">${esc(tm.name)}</span></p>`;
    $('#visual').innerHTML = `<div class="circwrap">${circleSVG(tm)}</div><div class="kbwrap"><p class="note">${esc(t('Tap a key to hear the note in this temperament.'))}</p>${keyboard(tm)}</div>`;
    $('#title2').textContent = tm.name;
    $('#detail').innerHTML = detail(tm);
    $('#tables').innerHTML = tables(tm);
    $('#compare').innerHTML = compareTable();
    bind();
  }
  let last = 'major';
  function bind() {
    $('#sel').onchange = e => { S.id = e.target.value; save(); stopAll(); render(); };
    $('#cmpSel').onchange = e => { S.cmp = e.target.value; save(); render(); };
    $('#root').onchange = e => { S.root = +e.target.value; save(); };
    $('#a4').onchange = e => { S.a4 = +e.target.value; save(); render(); };
    $('#tim').onchange = e => { S.timbre = e.target.value; save(); };
    $('#spd').oninput = e => { S.speed = +e.target.value; save(); };
    $('#hold').onchange = e => { S.hold = e.target.checked; save(); };
    $('#stop').onclick = stopAll;
    document.querySelectorAll('[data-play]').forEach(b => b.onclick = () => { last = b.dataset.play; play(last, 'A'); });
    const pb = $('#playB'); if (pb) pb.onclick = () => play(last, 'B');
    document.querySelectorAll('.k').forEach(k => k.onpointerdown = e => {
      e.preventDefault();
      const n = +k.dataset.n, c = ac(), tm = byId(S.id);
      tone(freq(tm, n, 4), c.currentTime + .01, 1.6, .18);
      k.classList.add('on'); setTimeout(() => k.classList.remove('on'), 400);
    });
    document.querySelectorAll('.pick').forEach(b => b.onclick = () => { S.id = b.dataset.id; save(); stopAll(); render(); $('#player').scrollIntoView({behavior: 'smooth', block: 'start'}); });
  }

  /* Marchetto: a 6–8 and a 3–5 progression with the sharp at four fifths of a whole tone above its natural */
  function marchetto(kind) {
    stopAll();
    const c = ac(), t0 = c.currentTime + .05, a = S.a4 / 2;           /* A = a (220 Hz at a′ 440) */
    const g = a * Math.pow(2, -203.91 / 1200), up = (f, ct) => f * Math.pow(2, ct / 1200);
    const sharpCents = {pyth: 113.69, mean: 76.05, march: 203.91 * 4 / 5}[kind];
    /* 6–8: A–F♯ to G–G (F♯ = F + chromatic semitone); 3–5: A–C♯ to G–D */
    const F = up(a, 792.18);                                        /* f′, a Pythagorean minor sixth above A */
    const Fs = up(F, sharpCents), G2 = up(g, 1200);
    const C = up(a, 294.13), Cs = up(C, sharpCents), D = up(g, 701.96);
    [[a, Fs, 0, 1.4], [g, G2, 1.4, 1.6], [a, Cs, 3.4, 1.4], [g, D, 4.8, 1.8]].forEach(([lo, hi, at, d]) => { tone(lo, t0 + at, d, .15); tone(hi, t0 + at, d, .15); });
  }

  /* ---------- page ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    render();
    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; try { localStorage.setItem('lang', lang); } catch (e) {} render(); }));
    document.querySelectorAll('[data-mar]').forEach(b => b.addEventListener('click', () => marchetto(b.dataset.mar)));
    $('#commas').innerHTML = `<table class="cm"><tbody>
      <tr><th>Pythagorean comma</th><td>531441 : 524288</td><td>${PC.toFixed(2)} c</td><td>twelve pure fifths minus seven octaves</td></tr>
      <tr><th>Syntonic comma</th><td>81 : 80</td><td>${SC.toFixed(2)} c</td><td>four pure fifths minus a pure major third and two octaves</td></tr>
      <tr><th>Schisma</th><td>32805 : 32768</td><td>${SCH.toFixed(2)} c</td><td>the difference between the two</td></tr>
      <tr><th>Diesis</th><td>128 : 125</td><td>${(1200 * Math.log2(128 / 125)).toFixed(2)} c</td><td>an octave minus three pure major thirds</td></tr></tbody></table>`;
    const root = document.documentElement;
    try { const th = localStorage.getItem('theme'); if (th) root.dataset.theme = th; } catch (e) {}
    $('#theme').addEventListener('click', () => {
      const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });
  });
  window.TUNING = {T, cents, PC, SC, tone, stopAll, ac, S, t: s => t(s), lang: () => lang, L};
})();
