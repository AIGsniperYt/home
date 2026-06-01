console.log("Main.js loaded!");
import { displayFlashcard, setAlgoFunctions } from './core.js';
import { pickNextCard } from './algo.js';

setAlgoFunctions({ pickNextCard });
displayFlashcard(pickNextCard().question);