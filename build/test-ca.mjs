// node build/test-ca.mjs — paraules conegudes que han de sortir (js/palabras/ca.js, l'escriu build/ca.mjs).
import { provar } from './leer.mjs';

await provar('ca', [
  ['gran', ['enorme', 'gegant', 'important'], ['petit']],
  ['bonic', ['bell', 'preciós', 'maco'], ['lleig']],
  ['trist', ['infeliç', 'melancòlic'], ['alegre', 'feliç']],
  ['alegre', ['feliç', 'content'], ['trist']],
  ['casa', ['llar', 'habitatge', 'edifici'], []],
  ['fred', ['gelat', 'glacial'], ['calent']],
  ['obrir', ['iniciar', 'inaugurar'], ['tancar']],
  ['pujar', ['augmentar'], ['baixar']],
  ['ric', [], ['pobre']],
  ['amor', ['estima', 'passió'], ['odi']],
  ['ràpid', ['veloç'], ['lent']],
  ['nit', [], ['dia']],
  ['bo', [], ['dolent']],
  ['veritat', [], ['mentida']],
], [['bonica', 'bonic'], ['corrent', 'córrer'], ['cases', 'casa'], ['vaig', 'anar'], ['grans', 'gran']]);
