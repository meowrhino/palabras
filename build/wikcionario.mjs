// Un Wikcionario sacado por kaikki.org (wiktextract, una entrada JSON por línea, .jsonl.gz): sinónimos y antónimos por
// acepción y las formas («corriendo» es de correr). Lo usan build/es.mjs y build/fr.mjs.
// Cada sinónimo trae su acepción: en el castellano, su número y su definición; en el francés, el título de su apartado
// («Qui dépasse une mesure moyenne (1)»). Las acepciones van en el orden del diccionario.
import { createReadStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import readline from 'node:readline';

const TIPO = { noun: 'n', adj: 'a', verb: 'v', adv: 'r', participle: 'a', phrase: 'o', intj: 'o', conj: 'o', prep: 'o', pron: 'o' };

export async function leerWikcionario(fichero, idioma, meter) {
  const conocidas = new Set(); // todo lo que tiene en ese idioma: sirve para filtrar erratas de otras fuentes
  const formas = new Map();
  const forma = (f, lema) => { if (f !== lema) (formas.get(f) || formas.set(f, new Set()).get(f)).add(lema); };
  for await (const l of readline.createInterface({ input: createReadStream(fichero).pipe(createGunzip()) })) {
    if (!l.includes(`"lang_code": "${idioma}"`)) continue;
    const j = JSON.parse(l);
    if (j.lang_code !== idioma || j.pos === 'name') continue;
    const w = j.word.toLowerCase();
    conocidas.add(w);
    for (const s of j.senses || []) for (const f of s.form_of || []) forma(w, f.word.toLowerCase());
    for (const f of j.forms || []) if (f.form && !/ /.test(f.form) && !f.tags?.includes('archaic')) forma(f.form.toLowerCase(), w);
    if (!j.synonyms && !j.antonyms) continue;
    const acep = new Map();
    for (const [campo, lista] of [['s', j.synonyms], ['a', j.antonyms]]) for (const x of lista || []) {
      const k = x.sense_index || x.sense || '';
      const a = acep.get(k) || acep.set(k, { p: TIPO[j.pos] || 'o', g: (x.sense || '').replace(/\s*\([\d, ]+\)\s*$/, ''), s: [], a: [] }).get(k);
      a[campo].push(x.word.toLowerCase());
    }
    const orden = [...acep.keys()].every((k) => /^\d/.test(k)) ? (k) => parseFloat(k) : () => 0; // por número, si lo tienen
    for (const [, a] of [...acep].sort(([x], [y]) => orden(x) - orden(y))) meter(w, a, { fijo: true });
  }
  return { conocidas, formas };
}
