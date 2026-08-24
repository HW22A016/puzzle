document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start');
    const titleArea = document.getElementById('title-area');
    const gameContainer = document.getElementById('game-container');

    startButton.addEventListener('click', () => {
        titleArea.classList.add('hidden');
        gameContainer.classList.remove('hidden');

        const puzzle = new Puzzle(6, 6, 30, 3);
        puzzle.init();
    });
});