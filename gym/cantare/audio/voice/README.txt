The voice is sung by CHIMERA, a physical vocal-tract synthesiser by Jameson Hodge (https://github.com/jamesondh/chimera-vocal-synth), MIT licence (see LICENSE-Chimera.txt), rendered offline with its command-line tool (chimera render notes, IPA syllables).

Every Latin syllable of the Cantare library is sung in the Italianate (ecclesiastical) pronunciation, in two rendered halves at every pitch of the bank (male body: MIDI 38-60, female body: 54-80, every whole tone):
  m_cvN.mp3 / f_cvN.mp3  onset consonants + vowel, held (e.g. "kw.i", "stɾ.a", ".a")
  m_vcN.mp3 / f_vcN.mp3  held vowel + coda consonants, or a diphthong's glide (e.g. "u.s", "a.ŋk", "aʊ.")
map.json names each half (onset.vowel / vowel.coda in IPA), with its number, the lead of its onset before the beat, and the place of its coda.
js/latin.js turns the sung text into these syllables.
