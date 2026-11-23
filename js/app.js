// app.js — carga la lista del idioma (js/palabras/<idioma>.js, la escribe build/<idioma>.mjs) y pinta sinónimos y antónimos.
// Cada línea de window.PALABRAS: la palabra y sus sentidos por tabulador, cada uno «tipo|glosa|sinónimos|antónimos»,
// las listas por uso con comas y, tras «;», las poco usadas. window.FORMAS: «forma\tlema,lema».
const TEXTOS = {
  es: { nombre: 'castellano', hueco: 'una palabra', sin: 'sinónimos', ant: 'antónimos', no: 'no conozco esa palabra', de: 'de', tambien: 'también de',
    tipos: { n: 'sustantivo', a: 'adjetivo', v: 'verbo', r: 'adverbio', o: 'otras' } },
  ca: { nombre: 'català', hueco: 'una paraula', sin: 'sinònims', ant: 'antònims', no: 'no conec aquesta paraula', de: 'de', tambien: 'també de',
    tipos: { n: 'nom', a: 'adjectiu', v: 'verb', r: 'adverbi', o: 'altres' } },
  en: { nombre: 'english', hueco: 'a word', sin: 'synonyms', ant: 'antonyms', no: 'unknown word', de: 'of', tambien: 'also of',
    tipos: { n: 'noun', a: 'adjective', v: 'verb', r: 'adverb', o: 'other' } },
  fr: { nombre: 'français', hueco: 'un mot', sin: 'synonymes', ant: 'antonymes', no: 'mot inconnu', de: 'de', tambien: 'aussi de',
    tipos: { n: 'nom', a: 'adjectif', v: 'verbe', r: 'adverbe', o: 'autres' } },
};
const RIMAS = 'https://rimas.meowrhino.studio/';
const HAY = ['es', 'ca', 'en', 'fr']; // los idiomas que ya tienen lista

const $ = (s) => document.querySelector(s);
const input = $('#palabra');
const llano = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC').replace(/œ/g, 'oe').replace(/æ/g, 'ae'); // «cancion» encuentra «canción»
let idioma = '';
let T;              // los textos del idioma
let dic, formas, porLlano;
let filtroP = '';   // tipo de palabra; '' = todos

async function cargar(l) {
  if (l === idioma) return;
  idioma = l; T = TEXTOS[l];
  document.documentElement.lang = l;
  $('#idiomas').innerHTML = HAY.map((k) => `<button data-l="${k}" aria-pressed="${k === l}">${TEXTOS[k].nombre}</button>`).join('');
  input.placeholder = T.hueco;
  $('#sinonimos h2').textContent = T.sin;
  $('#antonimos h2').textContent = T.ant;
  await new Promise((ok, mal) => document.head.append(Object.assign(document.createElement('script'), { src: `js/palabras/${l}.js`, onload: ok, onerror: mal })));
  dic = new Map(window.PALABRAS.split('\n').map((x) => { const i = x.indexOf('\t'); return [x.slice(0, i), x.slice(i + 1)]; }));
  formas = new Map(window.FORMAS ? window.FORMAS.split('\n').map((x) => { const [f, ls] = x.split('\t'); return [f, ls.split(',')]; }) : []);
  porLlano = new Map();
  for (const w of [...dic.keys(), ...formas.keys()]) porLlano.has(llano(w)) || porLlano.set(llano(w), w);
}

// la palabra que se pinta y de qué es forma: «corriendo» → correr; «casa» es casa y también de casar
function resolver(q) {
  const exacta = dic.has(q) || formas.has(q) ? q : porLlano.get(llano(q));
  if (!exacta) return {};
  const lemas = (formas.get(exacta) || []).filter((x) => dic.has(x));
  return dic.has(exacta) ? { w: exacta, otras: lemas, tambien: true, desde: exacta !== q && q } : { w: lemas[0], otras: lemas.slice(1), desde: q };
}

const sentidos = (w) => dic.get(w).split('\t').map((s) => {
  const [p, g, sin, ant] = s.split('|');
  const lista = (x) => { const [comunes = '', raras = ''] = (x || '').split(';'); return [...comunes.split(','), ...raras.split(',').map((r) => r && '~' + r)].filter(Boolean); };
  return { p, g, sin: lista(sin), ant: lista(ant) };
});

const li = (x) => (x[0] === '~' ? `<li class="raro" data-w="${x.slice(1)}">${x.slice(1)}</li>` : `<li data-w="${x}">${x}</li>`);
// los grupos por sentido; en los que no tienen definición (los del tesauro, muy parecidos entre sí) no se repite lo ya dicho
function grupos(lista, campo, conTipo) {
  const vistas = new Set();
  return lista.map((s) => {
    const palabras = s[campo].filter((x) => s.g || !vistas.has(x.replace('~', '')));
    palabras.forEach((x) => vistas.add(x.replace('~', '')));
    if (!palabras.length) return '';
    const tipo = conTipo && s.p ? `<i>${T.tipos[s.p]}</i>` : '';
    return `<div class="sentido">${s.g || tipo ? `<p class="glosa">${tipo}${s.g ? ' ' + s.g : ''}</p>` : ''}<ul>${palabras.map(li).join(' ')}</ul></div>`;
  }).join('');
}

function buscar() {
  const q = input.value.trim().toLowerCase().normalize('NFC');
  for (const d of document.querySelectorAll('main section > div')) d.innerHTML = '';
  $('#filtros').innerHTML = '';
  $('#hermana').href = RIMAS + (q ? `#${idioma}:${encodeURIComponent(q)}` : '');
  if (!q) { $('#analisis').textContent = ''; return; }
  history.replaceState(null, '', `#${idioma}:${q}`);
  const { w, otras = [], desde, tambien } = resolver(q);
  if (!w) { $('#analisis').textContent = T.no; return; }
  const enlace = (x) => `<a href="#${idioma}:${x}">${x}</a>`;
  $('#analisis').innerHTML = [desde ? `${desde} → <b>${w}</b>` : '', otras.length ? `${tambien ? T.tambien : T.de} ${otras.map(enlace).join(', ')}` : ''].filter(Boolean).join(' · ');
  const todos = sentidos(w);
  const tiposHay = new Set(todos.map((s) => s.p).filter(Boolean));
  if (filtroP && !tiposHay.has(filtroP)) filtroP = '';
  if (tiposHay.size > 1) $('#filtros').innerHTML = Object.entries(T.tipos).map(([k, t]) => (tiposHay.has(k) ? `<button data-p="${k}" aria-pressed="${k === filtroP}">${t}</button>` : '')).join('');
  const vistos = todos.filter((s) => !filtroP || !s.p || s.p === filtroP);
  $('#sinonimos div').innerHTML = grupos(vistos, 'sin', tiposHay.size > 1);
  $('#antonimos div').innerHTML = grupos(vistos, 'ant', tiposHay.size > 1);
}

async function desdeHash() {
  const [, l, q = ''] = location.hash.match(/^#(es|ca|en|fr):?(.*)$/) || [, 'es', location.hash.slice(1)];
  await cargar(HAY.includes(l) ? l : 'es');
  input.value = decodeURIComponent(q);
  buscar();
}

$('#buscar').onsubmit = (e) => { e.preventDefault(); buscar(); };
input.oninput = buscar;
$('#filtros').onclick = (e) => { if (e.target.dataset.p) { filtroP = filtroP === e.target.dataset.p ? '' : e.target.dataset.p; buscar(); } };
$('#idiomas').onclick = async (e) => { if (e.target.dataset.l) { await cargar(e.target.dataset.l); buscar(); input.focus(); } };
$('main').onclick = (e) => { const x = e.target.closest('li'); if (x) { history.pushState(null, '', `#${idioma}:${x.dataset.w}`); input.value = x.dataset.w; buscar(); scrollTo(0, 0); } }; // pushState: «atrás» vuelve a la anterior
// claro/oscuro: el del sistema, salvo que se toque el interruptor (se guarda)
$('#tema').onclick = () => {
  const oscuro = matchMedia('(prefers-color-scheme: dark)').matches;
  const actual = document.documentElement.dataset.theme || (oscuro ? 'dark' : 'light');
  const nuevo = actual === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nuevo;
  try { localStorage.setItem('tema', nuevo); } catch {}
};
window.onhashchange = desdeHash;
desdeHash();
