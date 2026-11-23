// node build/test-es.mjs — palabras conocidas que tienen que salir en la lista (js/palabras/es.js, la escribe build/es.mjs).
import { provar } from './leer.mjs';

// palabra, sinónimos que tiene que tener, antónimos que tiene que tener
await provar('es', [
  ['grande', ['enorme', 'amplio', 'colosal'], ['pequeño', 'chico']],
  ['bueno', ['bondadoso', 'útil', 'sabroso'], ['malo', 'malvado']],
  ['feliz', ['contento', 'alegre', 'dichoso'], ['triste', 'infeliz']],
  ['triste', ['afligido', 'melancólico'], ['feliz', 'alegre']],
  ['casa', ['hogar', 'domicilio', 'vivienda'], []],
  ['rápido', ['veloz', 'deprisa'], ['lento']],
  ['frío', ['helado', 'gélido'], ['caliente', 'calor']],   // del WordNet
  ['noche', [], ['día']],
  ['abrir', ['inaugurar', 'destapar'], ['cerrar']],
  ['subir', ['ascender', 'elevar'], ['bajar']],
  ['rico', ['adinerado', 'sabroso'], ['pobre']],
  ['verdad', ['certeza'], ['mentira', 'falsedad']],
  ['amor', ['cariño', 'afecto'], ['odio']],
  ['correr', ['conducir', 'perseguir'], []],
  ['bonito', ['lindo', 'hermoso'], ['feo']],
  ['enorme', ['grande'], ['pequeño']],          // al revés: grande la tiene a ella
  ['munificiente', ['bondadoso'], []],          // sin entrada propia, hereda el sentido de bueno
], [['corriendo', 'correr'], ['buenas', 'bueno'], ['fui', 'ir'], ['casas', 'casa'], ['dije', 'decir']], ({ sin, ant, glosas }) => [
  // que no se cuelen las formas de la propia palabra ni la palabra «antónimo» del Wikcionario; definiciones en minúscula, sin punto
  sin.get('casa').has('casas') && 'casa: se cuela casas',
  ant.get('feliz').has('antónimo') && 'feliz: se cuela «antónimo»',
  glosas.get('grande')[0] !== 'superior en tamaño a un determinado patrón tomado como medida' && `grande: la primera definición es «${glosas.get('grande')[0]}»`,
].filter(Boolean));
