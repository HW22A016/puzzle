document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const titleArea = document.getElementById('title-area');
    const gameContainer = document.getElementById('game-container');
    const timerElement = document.getElementById("timer");
    const gameBoard = document.getElementById('game-board');
    const menuArea = document.getElementById('menu-area');
    const titleButton = document.getElementById('title-button');
    const retryButton = document.getElementById('retry-button');

    let puzzle = null;
    let setTime = 10;
    let timer = 100;
    let timerInterval = null;

    startButton.addEventListener('click', () => {
        titleArea.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        menuArea.classList.remove('hidden');
        
        gameBoard.innerHTML = '';

        puzzle = new Puzzle(6, 6, 30, 3);
        puzzle.init();
        timerCount();
    });

    titleButton.addEventListener('click', () => {
        // titleArea.classList.remove('hidden');
        // gameContainer.classList.add('hidden');
        // menuArea.classList.add('hidden');
        location.reload();
    });

    retryButton.addEventListener('click', () => {
        gameBoard.innerHTML = '';

        puzzle = new Puzzle(6, 6, 30, 3);
        puzzle.init();
        timerCount();
    });

    function timerCount()
    {
        timer = setTime;
        timerElement.textContent = timer;

        timerInterval = setInterval(() => {
            timer--;
            timerElement.textContent = timer;
            if(timer <= 0)
            {
                // カウントダウンを止める
                clearInterval(timerInterval);
                puzzle.endGame();
            }
        }, 1000);
    }
});