// node build/ca.mjs <ca_full.txt> <th_ca_ES_v3.dat> <WNdb-3.0/dict> <wn-data-cat.tab> <adjs noms verbs advs…>
// Catalán, de:
// - El Diccionari de sinònims de Softcatalà (CC BY 4.0, Jaume Ortolà; LibreOffice/dictionaries, ca/dictionaries/th_ca_ES_v3.dat):
//   «paraula|n» y n líneas «(tipo; nota)|sinònim|…|contrari (antònim)|… (col·loquial)». La nota del tipo hace de definición.
// - El WordNet catalán del MCR (CC BY 3.0; omwn/omw-data, wns/mcr/wn-data-cat.tab), solo para antónimos (ver build/wordnet.mjs).
// - Las formas de FreeLing (data/ca/dictionary/entries: «forma lema etiqueta»), para buscar «bonica» o «corrent».
// Por uso con la lista de frecuencia de OpenSubtitles (hermitdave/FrequencyWords, content/2018/ca/ca_full.txt).
import { readFileSync } from 'node:fs';
import { frecuencia, tesauro } from './tesauro.mjs';
import { antonimosWordnet } from './wordnet.mjs';

const [fFrec, fTh, fDict, fMcr, ...fFormas] = process.argv.slice(2);
const rango = frecuencia(fFrec);
const { meter, opuestas, escribir } = tesauro();
const TIPO = { n: 'n', adj: 'a', v: 'v', adv: 'r', 'adj/n': 'a' };
const formas = new Map();
const conocidas = new Set();
for (const l of fFormas.flatMap((f) => readFileSync(f, 'utf8').split('\n'))) {
  const [f, lema] = l.split(' ');
  if (!lema) continue;
  conocidas.add(f).add(lema);
  if (f !== lema) (formas.get(f) || formas.set(f, new Set()).get(f)).add(lema);
}

const th = readFileSync(fTh, 'utf8').split('\n');
for (let i = 1; i < th.length; i++) {
  const [w, n] = th[i].split('|');
  if (!/^\d+$/.test(n)) continue;
  for (let k = 1; k <= +n; k++) {
    const [t, ...resto] = th[i + k].split('|');
    const [, tipo = '', nota = ''] = t.match(/^\(([^;)]*);?\s*([^)]*)\)/) || [];
    const s = [], a = [];
    for (const x of resto) {
      if (/\(ort\. pre-2017\)/.test(x)) continue;
      (/\(antònim\)/.test(x) ? a : s).push(x.replace(/\(.*?\)/g, '').trim().toLowerCase());
    }
    meter(w.toLowerCase(), { p: TIPO[tipo] || (tipo ? 'o' : ''), g: nota, s, a });
    s.concat(a).forEach((x) => conocidas.add(x));
  }
  conocidas.add(w.toLowerCase());
  i += +n;
}
for (const [P, A, p] of antonimosWordnet(fDict, fMcr)) {
  const [ps, as] = [P, A].map((l) => l.filter((x) => conocidas.has(x)));
  if (ps.length <= 6 && as.length <= 6) opuestas(ps, as, p);
}
escribir('ca', rango, formas);
