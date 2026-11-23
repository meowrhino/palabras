# palabras

Buscador de sinónimos y antónimos de manu, todo en el navegador; hermano de rimas (`~/Documents/GitHub/rimas`, mismo estilo,
`css/estilo.css` copiado de allí). `js/app.js` carga `js/palabras/<idioma>.js` y pinta; los textos de cada idioma, en `TEXTOS`,
y los idiomas con lista, en `HAY`. El enlace «rimas» lleva a `rimas.meowrhino.studio/#<idioma>:<palabra>`; rimas lleva aquí igual.

La lista la escribe `build/<idioma>.mjs` con `build/tesauro.mjs`: `window.PALABRAS`, una palabra por línea por orden de uso,
sus sentidos separados por tabulador, cada uno `tipo|glosa|sinónimos|antónimos` (tipo n a v r o, o vacío; listas por uso con
comas y, tras `;`, las poco usadas); `window.FORMAS`, `forma\tlema,lema`. Los sentidos de un diccionario con acepciones
(Wikcionario, WordNet) van en su orden; los del tesauro, por cuántas palabras corrientes tienen.
Cada idioma tiene su `build/test-<idioma>.mjs` con palabras conocidas: añade casos antes de tocar un script.
Los datos de origen (Wikcionario de kaikki.org, tesauros, wordnets, listas de frecuencia) no van en el repo.
