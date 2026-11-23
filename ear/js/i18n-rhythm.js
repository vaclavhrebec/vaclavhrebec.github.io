/* Ear training: translations added with the sampled piano, the scale directions and the rhythm room. */
'use strict';
(function () {
  const add = {
    de: {
      'random direction': 'zufällige Richtung', 'notes in random order': 'Töne in zufälliger Reihenfolge',
      'Piano sound: Salamander Grand Piano by Alexander Holm (CC BY 3.0).': 'Klavierklang: Salamander Grand Piano von Alexander Holm (CC BY 3.0).'
    },
    fr: {
      'random direction': 'sens aléatoire', 'notes in random order': 'notes dans un ordre aléatoire',
      'Piano sound: Salamander Grand Piano by Alexander Holm (CC BY 3.0).': 'Son de piano : Salamander Grand Piano d’Alexander Holm (CC BY 3.0).'
    },
    cs: {
      'random direction': 'náhodný směr', 'notes in random order': 'tóny v náhodném pořadí',
      'Piano sound: Salamander Grand Piano by Alexander Holm (CC BY 3.0).': 'Zvuk klavíru: Salamander Grand Piano od Alexandera Holma (CC BY 3.0).'
    }
  };
  window.EAR_T = window.EAR_T || {};
  for (const l in add) window.EAR_T[l] = Object.assign({}, add[l], window.EAR_T[l] || {});
})();
