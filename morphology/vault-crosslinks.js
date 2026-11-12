/* The Morphology of Music — cross-links loaded last: elements added in later files that also belong to earlier styles,
   and revivals (an old element taken up again appears as its modern counterpart, so no style lists an element outside its dates). */
(function (V) {
  const st = id => V.styles.find(s => s.id === id);
  const add = (style, ids) => ids.forEach(i => st(style).elements.includes(i) || st(style).elements.push(i));
  const drop = (style, ids) => { const s = st(style); s.elements = s.elements.filter(e => !ids.includes(e)); };
  add('chant-style', ['sequence-trope', 'hexachord', 'alternatim']);
  add('notre-dame', ['conductus', 'voice-exchange', 'hexachord']);
  add('ars-antiqua', ['conductus', 'voice-exchange']);
  add('english-style', ['voice-exchange']);
  add('ockeghem', ['mensuration-canon', 'alternatim', 'hexachord']);
  add('josquin', ['mensuration-canon', 'soggetto-cavato', 'frottola', 'printing', 'falsobordone', 'hexachord']);
  add('franco-flemish', ['parody-mass', 'printing', 'chorale', 'hexachord']);
  add('palestrina', ['parody-mass', 'falsobordone', 'printing', 'hexachord', 'diminution']);
  add('madrigal', ['frottola', 'printing', 'lute-song']);
  add('venetian', ['falsobordone', 'diminution', 'printing']);
  add('early-baroque', ['chorale', 'chorale-prelude', 'ground-bass', 'diminution']);
  add('high-baroque', ['chorale']);
  add('darmstadt', ['messiaen-modes', 'irregular-metre']);
  drop('neoclassicism', ['concerto-grosso']);
  drop('minimalism', ['ground-bass']);
  drop('hip-hop', ['ground-bass']);
  drop('holy-minimalism', ['church-modes']);
  drop('ragtime', ['binary-form']);
})(window.VAULT);
