let randomNumber = Math.floor(Math.random() * 100) + 1;
const userGuessInput = document.getElementById("guessInput");
const guessButton = document.getElementById("guessButton");
const feedback = document.getElementById("feedback");

guessButton.addEventListener("click", function() {
    const userGuess = parseInt(userGuessInput.value);

    if (userGuess === randomNumber) {
        feedback.textContent = "Congratulations! You guessed the correct number!";
        resetFeedback();
        randomNumber = Math.floor(Math.random() * 100) + 1;
    } else if (userGuess < randomNumber) {
        feedback.textContent = "Try a higher number.";
        resetFeedback();
    } else {
        feedback.textContent = "Try a lower number.";
        resetFeedback();
    }

});

function resetFeedback() {
    setTimeout(function() {
        feedback.textContent = "";
    }, 1500); // 3000 milliseconds (3 seconds) delay before clearing the feedback
}








