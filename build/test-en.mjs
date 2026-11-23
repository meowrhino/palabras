// node build/test-en.mjs — known words that must come out right (js/palabras/en.js, written by build/en.mjs).
import { provar } from './leer.mjs';

await provar('en', [
  ['big', ['large', 'huge', 'enormous'], ['small', 'little']],   // huge: satellite of large; small: antonym of the head
  ['happy', ['glad', 'felicitous'], ['unhappy']],
  ['sad', ['melancholy', 'sorrowful'], ['glad']],
  ['cold', ['chilly', 'frozen'], ['hot', 'warm']],
  ['open', ['ajar'], ['closed', 'shut']],
  ['fast', ['quick', 'rapid'], ['slow']],
  ['house', ['home', 'firm'], []],
  ['good', ['decent'], ['bad', 'evil']],
  ['love', ['passion', 'darling'], ['hate']],
  ['night', ['nighttime'], ['day']],
  ['rich', ['wealthy'], ['poor']],
  ['true', ['real', 'genuine'], ['false']],
  ['huge', ['large'], ['small']],
], [['running', 'run'], ['bigger', 'big'], ['went', 'go'], ['houses', 'house'], ['happier', 'happy'], ['children', 'child']]);
