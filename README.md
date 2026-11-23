# palabras

Buscador de sinónimos y antónimos en castellano, catalán, inglés y francés, sin servidor: todo pasa en el navegador.
Hermana de [rimas](https://rimas.meowrhino.studio): cada una enlaza a la otra con la palabra que se está buscando.
En https://palabras.meowrhino.studio: Cloudflare Workers Builds conectado al repo, cada push a `main` publica (a mano, `npx wrangler deploy`).

- `js/palabras/<idioma>.js`: la lista, una palabra por línea por orden de uso (OpenSubtitles), con sus sentidos; y las formas
  (corriendo → correr). Se regenera con `node build/<idioma>.mjs …` (cada script dice qué ficheros de origen necesita y de dónde
  bajarlos; no van en el repo).
- Fuentes: castellano, Wikcionario (por kaikki.org) + OpenThesaurus-es + antónimos del WordNet del MCR; catalán, el diccionari
  de sinònims de Softcatalà + antónimos del MCR + formas de FreeLing; inglés, Open English WordNet; francés, el Wiktionnaire.
- `build/tesauro.mjs`: lo común: junta los sentidos de varias fuentes (si comparten la mitad de las palabras son el mismo),
  completa al revés (si A tiene a B, B tiene a A; los antónimos valen para todo el sentido) y escribe la lista.
- `node build/test-<idioma>.mjs`: palabras conocidas que tienen que salir. Añade casos antes de tocar un script.

Para verla en local: cualquier servidor estático en la carpeta (`npx -y http-server@14.1.1`). La búsqueda va en la URL (`#ca:bonica`).
