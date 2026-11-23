// node build/es.mjs <es_full.txt> <raw-wiktextract-data.jsonl.gz> <th_es_v2.dat> <WNdb-3.0/dict> <wn-data-spa.tab>
// Castellano, de tres fuentes:
// - Wikcionario en español (CC BY-SA 4.0), sacado por kaikki.org (https://kaikki.org/eswiktionary/raw-wiktextract-data.jsonl.gz):
//   sinónimos y antónimos por acepción, con su definición, y las formas («corriendo» es de correr).
// - OpenThesaurus-es (LGPL 2.1), el tesauro de LibreOffice (LibreOffice/dictionaries, es/th_es_v2.dat, en ISO-8859-1):
//   más grupos de sinónimos, sin definición; se juntan con la acepción del Wikcionario que más se parezca.
// - El WordNet español del MCR (CC BY 3.0; omwn/omw-data, wns/mcr/wn-data-spa.tab), solo para antónimos, llevados desde
//   Princeton WordNet 3.0 (https://wordnetcode.princeton.edu/3.0/WNdb-3.0.tar.gz): frío ↔ caliente, noche ↔ día.
// Por uso con la lista de frecuencia de OpenSubtitles (hermitdave/FrequencyWords, content/2018/es/es_full.txt).
import { readFileSync } from 'node:fs';
import { frecuencia, tesauro } from './tesauro.mjs';
import { antonimosWordnet } from './wordnet.mjs';
import { leerWikcionario } from './wikcionario.mjs';

const [fFrec, fWikt, fOT, fDict, fMcr] = process.argv.slice(2);
const rango = frecuencia(fFrec);
const { meter, opuestas, escribir } = tesauro();
const { conocidas, formas } = await leerWikcionario(fWikt, 'es', meter);

// OpenThesaurus: «palabra|n» y n líneas «(tipo)|sinónimo|sinónimo…»; las notas entre paréntesis («(fig.)») fuera
const OT = { '(m.)': 'n', '(f.)': 'n', '(tr.)': 'v', '(intr.)': 'v', '(prnl.)': 'v', '(adj.)': 'a', '(adv.)': 'r' };
const ot = new TextDecoder('latin1').decode(readFileSync(fOT)).split('\n');
for (let i = 1; i < ot.length; i++) {
  const [w, n] = ot[i].split('|');
  if (!/^\d+$/.test(n)) continue;
  for (let k = 1; k <= +n; k++) {
    const [t, ...s] = ot[i + k].split('|');
    const limpias = s.map((x) => x.replace(/\(.*?\)/g, '').trim().toLowerCase()).filter((x) => conocidas.has(x));
    if (conocidas.has(w)) meter(w, { p: OT[t] || '', s: limpias });
  }
  i += +n;
}
// WordNet: solo palabras que conoce el Wikcionario, y synsets pequeños (los grandes mezclan sentidos)
for (const [P, A, p] of antonimosWordnet(fDict, fMcr)) {
  const [ps, as] = [P, A].map((l) => l.filter((x) => conocidas.has(x)));
  if (ps.length <= 6 && as.length <= 6) opuestas(ps, as, p);
}
escribir('es', rango, formas);
