// node build/en.mjs <en_full.txt> <english-wordnet-2025.xml>
// Inglés, de Open English WordNet 2025 (CC BY 4.0; globalwordnet/english-wordnet, english-wordnet-2025.xml.gz, descomprimido):
// un sentido por synset, en el orden de WordNet (el más usado primero), con su definición; sinónimos, los del synset y,
// en adjetivos, los de sus parecidos (big → huge, enormous); antónimos, los de la palabra y, en los satélites, los de su cabeza.
// Formas: las irregulares de WordNet y las regulares por reglas (morphy: runs, running, bigger).
// Por uso con la lista de frecuencia de OpenSubtitles (hermitdave/FrequencyWords, content/2018/en/en_full.txt).
import { readFileSync } from 'node:fs';
import { frecuencia, tesauro } from './tesauro.mjs';

const [fFrec, fXml] = process.argv.slice(2);
const rango = frecuencia(fFrec);
const { meter, escribir } = tesauro();
const TIPO = { n: 'n', v: 'v', a: 'a', s: 'a', r: 'r' };
const attr = (l, k) => l.match(new RegExp(`${k}="([^"]*)"`))?.[1];
const xml = (s) => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const entradas = []; // { w, p, sentidos: [{ id, synset, ant: [senseId] }] }
const lemaDe = new Map(); // id de entrada o de sentido → palabra
const synsets = new Map(); // id → { miembros, def, pos, parecidos }
const formas = new Map();
let e, sentido, ss;
for (const l of readFileSync(fXml, 'utf8').split('\n')) {
  if (l.includes('<LexicalEntry ')) entradas.push(e = { id: attr(l, 'id'), sentidos: [] });
  else if (l.includes('<Lemma ')) { e.w = xml(attr(l, 'writtenForm')); e.p = attr(l, 'partOfSpeech'); lemaDe.set(e.id, e.w); }
  else if (l.includes('<Form ')) (formas.get(xml(attr(l, 'writtenForm'))) || formas.set(xml(attr(l, 'writtenForm')), new Set()).get(xml(attr(l, 'writtenForm')))).add(e.w);
  else if (l.includes('<Sense ')) { e.sentidos.push(sentido = { id: attr(l, 'id'), synset: attr(l, 'synset'), ant: [] }); lemaDe.set(sentido.id, e.w); }
  else if (l.includes('<SenseRelation relType="antonym"')) sentido.ant.push(attr(l, 'target'));
  else if (l.includes('<Synset ')) synsets.set(attr(l, 'id'), ss = { miembros: attr(l, 'members').split(' '), pos: attr(l, 'partOfSpeech'), parecidos: [] });
  else if (l.includes('<Definition>')) ss.def ||= xml(l.replace(/.*<Definition>|<\/Definition>.*/g, ''));
  else if (l.includes('<SynsetRelation relType="similar"')) ss.parecidos.push(attr(l, 'target'));
}
// los antónimos de un synset: los de todos sus sentidos
const antSynset = new Map();
for (const x of entradas) for (const s of x.sentidos) for (const a of s.ant) (antSynset.get(s.synset) || antSynset.set(s.synset, new Set()).get(s.synset)).add(lemaDe.get(a));
const miembros = (id) => synsets.get(id)?.miembros.map((m) => lemaDe.get(m)) || [];
const minuscula = (w) => w === w.toLowerCase();
for (const x of entradas) {
  if (!minuscula(x.w)) continue; // nombres propios fuera
  for (const s of x.sentidos) {
    const y = synsets.get(s.synset);
    const sin = [...miembros(s.synset), ...(y.pos === 'a' || y.pos === 's' ? y.parecidos.flatMap(miembros) : [])];
    const ant = [...s.ant.map((a) => lemaDe.get(a)), ...(y.pos === 's' ? y.parecidos.flatMap((h) => [...antSynset.get(h) || []]) : [])];
    meter(x.w, { p: TIPO[y.pos], g: y.def || '', s: sin.filter(minuscula), a: ant.filter(minuscula) }, { fijo: true });
  }
}
// formas regulares (morphy de WordNet): de la lista de frecuencia, las que no son palabra y llevan a una que sí lo es
const lemas = new Map(entradas.filter((x) => minuscula(x.w)).map((x) => [`${x.w}|${x.p === 's' ? 'a' : x.p}`, x.w]));
const REGLAS = { n: [['s', ''], ['ses', 's'], ['xes', 'x'], ['zes', 'z'], ['ches', 'ch'], ['shes', 'sh'], ['men', 'man'], ['ies', 'y']],
  v: [['s', ''], ['ies', 'y'], ['es', 'e'], ['es', ''], ['ed', 'e'], ['ed', ''], ['ing', 'e'], ['ing', '']], a: [['er', ''], ['est', ''], ['er', 'e'], ['est', 'e'], ['ier', 'y'], ['iest', 'y']] };
for (const f of readFileSync(fFrec, 'utf8').split('\n').slice(0, 150000).map((l) => l.split(' ')[0])) {
  if (!f || lemas.has(`${f}|n`) || lemas.has(`${f}|v`) || lemas.has(`${f}|a`)) continue;
  for (const [p, reglas] of Object.entries(REGLAS)) for (const [de, a] of reglas) {
    if (!f.endsWith(de)) continue;
    let b = f.slice(0, -de.length) + a;
    if (!lemas.has(`${b}|${p}`) && /([b-df-hj-np-tv-z])\1$/.test(b)) b = b.slice(0, -1); // running → run, bigger → big
    if (lemas.has(`${b}|${p}`)) (formas.get(f) || formas.set(f, new Set()).get(f)).add(b);
  }
}
escribir('en', rango, formas);
