console.log("Algo.js loaded!");
import { getFlashcards } from './core.js';

export function pickNextCard() {
    return getFlashcards()[0];
}