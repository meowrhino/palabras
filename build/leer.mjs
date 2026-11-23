// Lee js/palabras/<idioma>.js para los tests: sinónimos y antónimos de cada palabra (todos los sentidos juntos),
// sus definiciones y las formas.
export async function leer(idioma) {
  globalThis.window = {};
  await import(`../js/palabras/${idioma}.js`);
  const sin = new Map(), ant = new Map(), glosas = new Map();
  const palabras = (x) => (x || '').split(/[,;]/).filter(Boolean);
  for (const linea of window.PALABRAS.split('\n')) {
    const [w, ...sentidos] = linea.split('\t');
    const partes = sentidos.map((s) => s.split('|'));
    sin.set(w, new Set(partes.flatMap((p) => palabras(p[2]))));
    ant.set(w, new Set(partes.flatMap((p) => palabras(p[3]))));
    glosas.set(w, partes.map((p) => p[1]).filter(Boolean));
  }
  const formas = new Map(window.FORMAS.split('\n').map((l) => { const [f, ls] = l.split('\t'); return [f, ls.split(',')]; }));
  return { sin, ant, glosas, formas };
}

// Lo que comprueban todos los tests: cada palabra tiene esos sinónimos y antónimos (y no a sí misma), y cada forma lleva a su palabra.
export async function provar(idioma, casos, formasBien = [], mas = () => []) {
  const datos = await leer(idioma);
  const { sin, ant, formas } = datos;
  const mal = [];
  for (const [w, s, a] of casos) {
    if (!sin.has(w)) { mal.push(`${w}: no está`); continue; }
    for (const x of s) if (!sin.get(w).has(x)) mal.push(`${w}: falta el sinónimo ${x}`);
    for (const x of a) if (!ant.get(w).has(x)) mal.push(`${w}: falta el antónimo ${x}`);
    if (sin.get(w).has(w) || ant.get(w).has(w)) mal.push(`${w}: sale ella misma`);
  }
  for (const [f, l] of formasBien) if (!formas.get(f)?.includes(l)) mal.push(`${f} tendría que llevar a ${l}`);
  mal.push(...mas(datos));
  mal.forEach((m) => console.log('✗ ' + m));
  console.log(mal.length ? `${mal.length} mal` : `✓ ${casos.length} palabras y ${formasBien.length} formas bien`);
  process.exit(mal.length ? 1 : 0);
}
