// Antónimos de un wordnet de otro idioma (Open Multilingual Wordnet: «wn-data-<idioma>.tab», synsets de Princeton 3.0)
// llevados desde Princeton WordNet 3.0 (WNdb-3.0, carpeta dict/): si dos synsets son antónimos en inglés, sus palabras
// lo son en el otro idioma. Los adjetivos satélite (enorme, de grande) heredan el antónimo de su cabeza (pequeño).
import { readFileSync } from 'node:fs';

const TIPO = { n: 'n', v: 'v', a: 'a', s: 'a', r: 'r' };

export function antonimosWordnet(dict, tab) {
  const ant = new Map(); // synset → Set(synset)
  const similar = new Map(); // satélite → cabeza
  const id = (off, pos) => `${off}-${pos === 's' ? 'a' : pos}`;
  for (const f of ['noun', 'verb', 'adj', 'adv']) {
    for (const l of readFileSync(`${dict}/data.${f}`, 'utf8').split('\n')) {
      if (!l || l[0] === ' ') continue;
      const t = l.split(' ');
      const yo = id(t[0], t[2]);
      let i = 4 + parseInt(t[3], 16) * 2;
      const n = +t[i++];
      for (let k = 0; k < n; k++, i += 4) {
        const otro = id(t[i + 1], t[i + 2]);
        if (t[i] === '!') (ant.get(yo) || ant.set(yo, new Set()).get(yo)).add(otro);
        if (t[i] === '&' && t[2] === 's') similar.set(yo, otro);
      }
    }
  }
  for (const [sat, cabeza] of similar) for (const o of ant.get(cabeza) || []) (ant.get(sat) || ant.set(sat, new Set()).get(sat)).add(o);
  const lemas = new Map();
  for (const l of readFileSync(tab, 'utf8').split('\n')) {
    const [s, tipo, lema] = l.split('\t');
    if (tipo?.endsWith(':lemma')) (lemas.get(s) || lemas.set(s, []).get(s)).push(lema.replace(/_/g, ' ').toLowerCase());
  }
  const pares = [];
  for (const [a, bs] of ant) for (const b of bs) if (lemas.has(a) && lemas.has(b)) pares.push([lemas.get(a), lemas.get(b), TIPO[a.slice(-1)]]);
  return pares; // [[palabras, sus antónimos, tipo]]
}
