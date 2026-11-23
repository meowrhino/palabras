// node build/fr.mjs <fr_full.txt> <kaikki.org-dictionary-Français.jsonl.gz>
// Francés, del Wiktionnaire (CC BY-SA 4.0), sacado por kaikki.org (https://kaikki.org/frwiktionary/Français/, el .jsonl.gz):
// sinónimos y antónimos por apartado («Qui dépasse une mesure moyenne»), y las formas («grandes» es de grand).
// Sin wordnet: WOLF (el del francés) mete demasiado ruido en los antónimos (maison ↔ loin, rapide ↔ idiot).
// Por uso con la lista de frecuencia de OpenSubtitles (hermitdave/FrequencyWords, content/2018/fr/fr_full.txt).
import { frecuencia, tesauro } from './tesauro.mjs';
import { leerWikcionario } from './wikcionario.mjs';

const [fFrec, fWikt] = process.argv.slice(2);
const rango = frecuencia(fFrec);
const { meter, escribir } = tesauro();
const { formas } = await leerWikcionario(fWikt, 'fr', meter);
escribir('fr', rango, formas);
