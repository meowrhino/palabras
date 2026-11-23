// node build/test-fr.mjs — mots connus qui doivent sortir (js/palabras/fr.js, écrit par build/fr.mjs).
import { provar } from './leer.mjs';

await provar('fr', [
  ['grand', ['gros', 'vaste', 'adulte'], ['petit', 'court']],
  ['heureux', ['content', 'ravi', 'joyeux'], ['triste', 'malheureux']],
  ['triste', ['malheureux', 'mélancolique'], ['heureux', 'gai']],
  ['froid', [], ['chaud']],
  ['ouvrir', [], ['fermer']],
  ['rapide', ['prompt', 'véloce'], ['lent']],
  ['maison', ['foyer', 'domicile', 'demeure'], []],
  ['bon', ['généreux', 'délicieux'], ['mauvais']],
  ['amour', ['affection', 'passion'], ['haine']],
  ['nuit', [], ['jour']],
  ['riche', ['fortuné', 'aisé'], ['pauvre']],
  ['vrai', ['exact', 'réel'], ['faux']],
  ['beau', ['joli', 'magnifique'], ['laid', 'affreux']],
], [['grandes', 'grand'], ['maisons', 'maison'], ['suis', 'être'], ['belle', 'beau'], ['allé', 'aller']], ({ sin }) => [
  sin.get('vrai').has('homogramme') && 'vrai: se cuela «homogramme»',
].filter(Boolean));
