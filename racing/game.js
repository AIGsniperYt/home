document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const status = document.getElementById("status");

    let currentPlayer = "X";
    let gameBoard = ["", "", "", "", "", "", "", "", ""];

    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            const index = cell.id;
            if (!gameBoard[index]) {
                cell.textContent = currentPlayer;
                gameBoard[index] = currentPlayer;
                // Check for winner
                if (checkWinner(currentPlayer)) {
                    status.textContent = `${currentPlayer} wins!`;
                    disableCells();
                } else if (!gameBoard.includes("")) {
                    status.textContent = "It's a draw!";
                } else {
                    currentPlayer = currentPlayer === "X" ? "O" : "X";
                    status.textContent = `Player ${currentPlayer}'s turn`;
                }
            }
        });
    });

    function checkWinner(player) {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winningCombos.some(combo => {
            return combo.every(index => {
                return gameBoard[index] === player;
            });
        });
    }

    function disableCells() {
        cells.forEach(cell => {
            cell.style.pointerEvents = "none";
        });
    }
});
