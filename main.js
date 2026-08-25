document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const titleArea = document.getElementById('title-area');
    const gameContainer = document.getElementById('game-container');
    // const timerElement = document.getElementById("timer");
    const gameBoard = document.getElementById('game-board');
    const menuArea = document.getElementById('menu-area');
    const titleButton = document.getElementById('title-button');
    const retryButton = document.getElementById('retry-button');

    let puzzle = null;

    startButton.addEventListener('click', () => {
        titleArea.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        menuArea.classList.remove('hidden');
        
        gameBoard.innerHTML = '';

        puzzleInit();
    });

    titleButton.addEventListener('click', () => {
        // titleArea.classList.remove('hidden');
        // gameContainer.classList.add('hidden');
        // menuArea.classList.add('hidden');
        location.reload();
    });

    retryButton.addEventListener('click', () => {
        gameBoard.innerHTML = '';

        clearInterval(puzzle.timerInterval);

        puzzleInit();
    });

    function puzzleInit()
    {
        puzzle = new Puzzle(6, 6, 30, 3, 3000, 100);
        puzzle.init();
    }
});