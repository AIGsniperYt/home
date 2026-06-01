console.log("Core.js loaded!");
let algoFunctions;

export function setAlgoFunctions(functions) {
    algoFunctions = functions;
}

export function displayFlashcard(question) {
    document.getElementById("flashcard-container").innerHTML = question;
}

export function getFlashcards() {
    return [{ question: "What is 2+2?", answer: "4" }];
}