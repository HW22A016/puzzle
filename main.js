import ModelController from './ModelController.js';

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const titleArea = document.getElementById('title-area');
    const gameContainer = document.getElementById('game-container');
    // const timerElement = document.getElementById("timer");
    const gameBoard = document.getElementById('game-board');
    const timeOver = document.getElementById('time-over');   
    const gameClear = document.getElementById('game-clear');   
    const menuArea = document.getElementById('menu-area');
    const titleButton = document.getElementById('title-button');
    const retryButton = document.getElementById('retry-button');

    let puzzle = null;
    let modelController = null;
    const rows = 6;
    const cols = 6;
    const draggingDistance = 30;
    const matchCount = 3
    const targetScore = 3000
    const timeLimit = 100;

    modelController = new ModelController('model-area', './glb/stage.glb',targetScore);
    startButton.addEventListener('click', () => {
        titleArea.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        menuArea.classList.remove('hidden');
        
        gameBoard.innerHTML = '';

        puzzleInit();

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
        customEventListener();
    });

    titleButton.addEventListener('click', () => {
        location.reload();
    });

    retryButton.addEventListener('click', () => {
        gameBoard.innerHTML = '';

        clearInterval(puzzle.timerInterval);

        timeOver.classList.add('hidden');
        gameClear.classList.add('hidden');

        puzzleInit();
    });

    function puzzleInit()
    {
        puzzle = new Puzzle(rows, cols, draggingDistance, matchCount, targetScore, timeLimit);
    }

    function customEventListener()
    {
        window.addEventListener('sendScore', (customEvent) => {
            const score = customEvent.detail.score;
            const scoreElement = document.getElementById("score");
            scoreElement.textContent = score;
        });

        window.addEventListener('sendCombo', (customEvent) => {
            const combo = customEvent.detail.combo;
            const comboElement = document.getElementById("combo");
            comboElement.textContent = combo;
        });
    }
});