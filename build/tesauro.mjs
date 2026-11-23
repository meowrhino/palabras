// Lo común a todos los idiomas: juntar sentidos de varias fuentes, completar al revés y escribir js/palabras/<idioma>.js.
// Un sentido es { p: tipo (n a v r o, o ''), g: glosa, s: sinónimos, a: antónimos }.
import { readFileSync, writeFileSync } from 'node:fs';

// rango de uso: la posición en la lista de frecuencia (OpenSubtitles, hermitdave/FrequencyWords), 1 = la más usada.
// Una expresión («darse prisa») vale lo que su palabra menos usada.
export function frecuencia(fichero) {
  const rango = new Map();
  for (const linea of readFileSync(fichero, 'utf8').split('\n')) {
    const w = linea.split(' ')[0];
    if (w && !rango.has(w)) rango.set(w, rango.size + 1);
  }
  return (w) => Math.max(...w.split(/[ -]/).map((x) => rango.get(x) || Infinity));
}

const RARO = 40000; // a partir de este rango, la palabra sale en gris
const NO = new Set(['sinónimo', 'antónimo', 'sinónimos', 'antónimos', 'synonym', 'antonym', 'synonyme', 'antonyme', 'sinònim', 'antònim', 'homogramme', 'paronyme']);
const bien = (w) => /^\p{L}[\p{L}\p{M}' ·.-]{0,40}$/u.test(w) && !/[ -]$/.test(w) && !NO.has(w);

export function tesauro() {
  const dic = new Map(); // palabra → [sentido]
  const propias = new Set(); // las que tienen entrada propia en alguna fuente (no solo heredada)
  // dos sentidos son el mismo si comparten la mitad de las palabras del menor (contra las de origen, para que no crezca en bola)
  const elMismo = (l, p, s, a) => l.find((x) => !x.suelto && (!p || !x.p || p === x.p) && (() => {
    const n = [...s].filter((v) => x.base.has(v)).length + [...a].filter((v) => x.abase.has(v)).length;
    return n >= 3 || (n && n * 2 >= Math.min(x.base.size + x.abase.size, s.size + a.size));
  })());
  // fijo: los sentidos de un diccionario (el Wikcionario), que ya vienen en su orden; los demás se ordenan por uso
  function meter(w, { p = '', g = '', s = [], a = [] }, { propia = true, fijo = false } = {}) {
    if (!bien(w)) return;
    s = new Set([...s].filter((v) => v !== w && bien(v)));
    a = new Set([...a].filter((v) => v !== w && bien(v) && !s.has(v)));
    if (!s.size && !a.size) return;
    if (propia) propias.add(w);
    const l = dic.get(w) || dic.set(w, []).get(w);
    const x = elMismo(l, p, s, a);
    if (x) { s.forEach((v) => x.s.add(v)); a.forEach((v) => x.a.add(v)); x.g ||= g; x.p ||= p; }
    else l.push({ p, g, s, a, base: new Set(s), abase: new Set(a), fijo });
  }
  // una palabra suelta para w, en el sentido de w que más se parezca a «junto», o en el cajón del final
  function suelta(w, p, junto, campo, palabras) {
    if (!bien(w)) return;
    const l = dic.get(w) || dic.set(w, []).get(w);
    let x = elMismo(l, p, junto, new Set());
    if (!x) x = l.find((y) => y.suelto && y.p === p) || l[l.push({ p, g: '', s: new Set(), a: new Set(), suelto: true }) - 1];
    for (const v of palabras) if (v !== w && bien(v) && !x.s.has(v) && !x.a.has(v)) x[campo].add(v);
  }
  // Al revés: si A tiene a B de sinónimo, B tiene a A (y si B no tenía nada suyo, hereda el sentido entero);
  // los antónimos de un sentido valen para los sinónimos de origen de ese sentido (no los que se le juntaron de otra
  // fuente, que lo harían crecer en bola): grande, enorme ↔ pequeño, chico.
  function completar() {
    for (const [w, l] of [...dic].map(([w, l]) => [w, [...l]])) {
      if (!propias.has(w)) continue;
      for (const x of l) {
        if (x.suelto) continue;
        const P = new Set([w, ...x.base]);
        for (const b of x.s) {
          if (propias.has(b)) suelta(b, x.p, P, 's', [w]);
          else meter(b, { p: x.p, g: x.g, s: P, a: x.abase }, { propia: false });
        }
        for (const b of x.base) if (x.abase.size && propias.has(b)) suelta(b, x.p, P, 'a', x.abase);
        for (const c of x.abase) suelta(c, x.p, x.abase, 'a', P);
      }
    }
  }
  // Escribe js/palabras/<idioma>.js: window.PALABRAS, una palabra por línea por orden de uso, sus sentidos separados por
  // tabulador, cada uno «tipo|glosa|sinónimos|antónimos»; las listas por uso, con comas, y tras «;» las poco usadas.
  // window.FORMAS: «forma\tlema,lema» para buscar «corriendo» o «buenas».
  function escribir(idioma, rango, formas = new Map()) {
    completar();
    // fuera las formas de la propia palabra (casas en casa) y las sin entrada propia de otra de la lista (rauda con raudo)
    const lista = (w, set) => {
      const v = [...set].filter((x) => ![...formas.get(x) || []].some((l) => l === w || (set.has(l) && !propias.has(x)))).sort((x, y) => rango(x) - rango(y) || x.localeCompare(y));
      return [v.filter((x) => rango(x) <= RARO).join(','), v.filter((x) => rango(x) > RARO).join(',')].filter((x, i) => x || i === 0).join(';');
    };
    const limpia = (g) => g.replace(/[|\t\n]/g, ' ').replace(/[₀-₉₋]+/g, '').replace(/\s+/g, ' ').trim().replace(/\.$/, '')
      .replace(/^\p{Lu}(?!\p{Lu})/u, (c) => c.toLowerCase()); // en minúscula, salvo siglas
    const palabras = [...dic].filter(([, l]) => l.some((x) => x.s.size || x.a.size))
      .sort(([x], [y]) => rango(x) - rango(y) || x.localeCompare(y));
    // los grupos sin tipo (los del tesauro) toman el de la palabra si solo tiene uno
    for (const [, l] of palabras) { const t = new Set(l.map((x) => x.p).filter(Boolean)); if (t.size === 1) for (const x of l) x.p ||= [...t][0]; }
    // orden: los del diccionario como vienen; luego los demás por cuántas palabras de uso corriente tienen (el sentido
    // central de una palabra suele ser el que más tiene: gran → enorme, gegant… antes que primer, hereu); al final, los cajones
    const uso = (x) => -[...x.s, ...x.a].filter((v) => rango(v) <= RARO).length;
    const ordenar = (l) => [...l.filter((x) => x.fijo), ...l.filter((x) => !x.fijo && !x.suelto).sort((x, y) => uso(x) - uso(y)), ...l.filter((x) => x.suelto)];
    const lineas = palabras.map(([w, l]) => [w, ...ordenar(l)
      .filter((x) => x.s.size || x.a.size).map((x) => [x.p, limpia(x.g), lista(w, x.s), lista(w, x.a)].join('|'))].join('\t'));
    const hay = new Set(dic.keys());
    const lf = [...formas].filter(([f]) => rango(f) < 150000).map(([f, ls]) => [f, [...ls].filter((x) => x !== f && hay.has(x))]).filter(([, ls]) => ls.length)
      .sort(([x], [y]) => rango(x) - rango(y)).map(([f, ls]) => `${f}\t${ls.join(',')}`);
    writeFileSync(new URL(`../js/palabras/${idioma}.js`, import.meta.url),
      `window.PALABRAS=${JSON.stringify(lineas.join('\n'))};\nwindow.FORMAS=${JSON.stringify(lf.join('\n'))};\n`);
    console.log(`${idioma}: ${lineas.length} palabras, ${lf.length} formas`);
  }
  // antónimos de otra fuente (un wordnet): a cada palabra de «palabras», en su sentido que más se parezca al grupo
  const opuestas = (palabras, contrarias, p) => { for (const w of palabras) suelta(w, p, new Set(palabras), 'a', contrarias); };
  return { meter, opuestas, escribir, dic };
}
