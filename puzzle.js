class Puzzle
{
    constructor(rows = 6, cols = 6, draggingDistance, matchCount)
    {
        this.ROWS = rows;   //行　縦
        this.COLS = cols;   //列　横
        this.COLORS = [
            '#FF0000',
            '#0000FF',
            '#FFFF00',
            '#008000',
            '#000000'
        ];

        this.board = [];
        this.score = 0;
        this.matchCount = matchCount;

        this.draggingDistance = draggingDistance;

        this.startTile = null; // クリックしたタイル情報を保存
        this.startX = 0;
        this.startY = 0;
        this.isDragging = false;
    }


    // 初期化
    init()
    {
        const boardElement = document.getElementById('game-board');

        for(let r = 0; r < this.ROWS; r++)
        {
            this.board[r] = [];
            for(let c = 0; c < this.COLS; c++)
            {
                const colorId = this.createNotMatchColors(r, c);
                this.board[r][c] = colorId;

                this.createTile(boardElement, r, c, colorId);
            }
        }

        window.addEventListener('mousemove', (e) => this.dragMove(e));
        window.addEventListener('touchmove', (e) => this.dragMove(e), {passive: false});

        window.addEventListener('mouseup', () => this.dragEnd());
        window.addEventListener('touchend', () => this.dragEnd());
    }

    selectColors()
    {
        return Math.floor(Math.random() * this.COLORS.length) + 1
    }

    // 初期配置で揃わないようにする
    createNotMatchColors(r, c)
    {
        let colorId;
        while(true)
        {
            colorId = this.selectColors();
            const matchLeft = ((this.matchCount - 1) <= c && this.board[r][c - 1] === colorId && this.board[r][c - 2] === colorId);
            const matchUp = ((this.matchCount - 1) <= r && this.board[r - 1][c] === colorId && this.board[r - 2][c] === colorId);

            if(!matchLeft && !matchUp)
            {
                break;
            }
        }
        return colorId;
    }

    // タイルを作成
    createTile(boardElement, r, c, colorId)
    {
        const tile = document.createElement('div');

        // class="tile"を付与
        tile.classList.add('tile');

        // id="tile-r-c"を付与
        tile.id = `tile-${r}-${c}`;

        tile.style.backgroundColor = this.COLORS[colorId - 1];

        // マウス用のイベント
        tile.addEventListener('mousedown', (e) => this.dragStart(e, r, c));

        // タッチ操作用のイベント
        tile.addEventListener('touchstart', (e) => this.dragStart(e, r, c));
        
        // game-boardの子供の末尾にtileを追加
        boardElement.appendChild(tile);
    }

    dragStart(e, r, c)
    {
        this.isDragging = true;
        this.startTile = { r: r, c: c};

        // スマホタッチの時にe.touches[0].pageX でなければ e.pageX;
        this.startX = e.touches ? e.touches[0].pageX : e.pageX;
        this.startY = e.touches ? e.touches[0].pageY : e.pageY;

        const tile = document.getElementById(`tile-${r}-${c}`);
        if(tile)
        {
            tile.style.opacity = '0.6';
        }
    }

    dragEnd()
    {
        if(!this.isDragging) return;

        if(this.startTile)
        {
            const tile = document.getElementById(`tile-${this.startTile.r}-${this.startTile.c}`);
            if(tile)
            {
                tile.style.opacity = '1.0';
            }

            this.isDragging = false;
            this.startTile = null;
        }
    }

    dragMove(e)
    {
        if (!this.isDragging || !this.startTile) return;

        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const pageY = e.touches ? e.touches[0].pageY : e.pageY;

        const diffX = pageX - this.startX;
        const diffY = pageY - this.startY;

        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        if(this.draggingDistance < absX || this.draggingDistance < absY)
        {
            let targetR = this.startTile.r;
            let targetC = this.startTile.c;

            if(absX > absY)
            {
                if(0 < diffX) targetC++;
                else targetC--;
            }
            else
            {
                if(0 < diffY) targetR++;
                else targetR--;
            }

            // 盤面の外に出ていないかチェック
            if(0 <= targetR && targetR < this.ROWS && 0 <= targetC && targetC < this.COLS)
            {
                this.swapTiles(this.startTile.r, this.startTile.c, targetR, targetC);
            }

            this.dragEnd();
        }
    }

    // 場所の入れ替え
    swapTiles(r1, c1, r2, c2)
    {
        const tempId = this.board[r1][c1];
        this.board[r1][c1] = this.board[r2][c2];
        this.board[r2][c2] = tempId;

        // const tile1 = document.getElementById(`tile-${r1}-${c1}`);
        // const tile2 = document.getElementById(`tile-${r2}-${c2}`);

        // tile1.style.backgroundColor = this.COLORS[this.board[r1][c1] - 1];
        // tile2.style.backgroundColor = this.COLORS[this.board[r2][c2] - 1];

        this.updateBoardColor();

        // 入れ替えた後に揃っているかをチェックする
        this.checkMathces();
    }

    // 盤面の色を更新する
    updateBoardColor()
    {
        for(let r = 0; r < this.ROWS; r++)
        {
            for(let c = 0; c < this.COLS; c++)
            {
                const tile = document.getElementById(`tile-${r}-${c}`);
                const colorId = this.board[r][c];
                if(tile)
                {
                    if(colorId === 0)
                    {
                        tile.style.backgroundColor = 'transparent'; //透明にする
                    }
                    else
                    {
                        tile.style.backgroundColor = this.COLORS[colorId - 1];
                    }
                }
            }
        }
    }

    checkMathces()
    {
        const matched = this.findMatches();
        const matchLen = matched.length;

        // 揃っている部分が無ければリターン
        if(matchLen === 0)
        {
            return;
        }

        setTimeout(() => {
            this.score += matchLen * 10;
            this.scoreDisplay();

            // 揃っていれば消去する座標に0を入れる
            for(const id of matched)
            {
                this.board[id.r][id.c] = 0;
            }
            this.updateBoardColor();

            setTimeout(() => {
                this.dropTiles();
                this.generateTiles();
                this.updateBoardColor();

                this.checkMathces();
            }, 300);
        }, 500);
    }

    // 揃っている部分があるか判定
    findMatches()
    {
        const matched = [];
        const matchMap = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(false));

        // 横が揃っているか判定
        for(let r = 0; r < this.ROWS; r++)
        {
            for(let c = 0; c < this.COLS - (this.matchCount - 1); c++)
            {
                const ids = [];
                for(let i = 0; i < this.matchCount; i++)
                {
                    ids.push(this.board[r][c + i]);
                }

                const firstId = ids[0];

                const isMatch = ids.every(id => id === firstId);

                if(isMatch)
                {
                    for(let i = 0; i < this.matchCount; i++)
                    {
                        matchMap[r][c + i] = true;
                    }
                }
            }
        }

        // 縦が揃っているか判定
        for(let c = 0; c < this.COLS; c++)
        {
            for(let r = 0; r < this.ROWS - (this.matchCount - 1); r++)
            {
                const ids = [];
                for(let i = 0; i < this.matchCount; i++)
                {
                    ids.push(this.board[r + i][c]);
                }

                const firstId = ids[0];

                const isMatch = ids.every(id => id === firstId);

                if(isMatch)
                {
                    for(let i = 0; i < this.matchCount; i ++)
                    {
                        matchMap[r + i][c] = true;
                    }
                }
            }
        }

        for(let r = 0; r < this.ROWS; r++)
        {
            for(let c = 0; c < this.COLS; c++)
            {
                if(matchMap[r][c])
                {
                    matched.push({r: r, c: c});
                }
            }
        }

        return matched;
    }

    // 消えた分下に落とす
    dropTiles()
    {
        // 列ごとに下から上に見ていく
        for(let c = 0; c < this.COLS; c++)
        {
            let emptyRow = this.ROWS - 1;
            for(let r = this.ROWS - 1; 0 <= r; r--)
            {
                if(this.board[r][c] !== 0)
                {
                    if(r !== emptyRow)
                    {
                        this.board[emptyRow][c] = this.board[r][c];
                        this.board[r][c] = 0;
                    }
                    emptyRow--;
                }
            }
        }
    }

    // 生成
    generateTiles()
    {
        for(let r = 0; r < this.ROWS; r++)
        {
            for(let c = 0; c < this.COLS; c++)
            {
                if(this.board[r][c] === 0)
                {
                    const colorId = this.selectColors();
                    this.board[r][c] = colorId;
                }
            }
        }
    }

    scoreDisplay()
    {
        const scoreElement = document.getElementById("score");
        if(score)
        {
            scoreElement.textContent = this.score;
        }
    }
}

window.onload = () =>
{
    const puzzle = new Puzzle(6, 6, 30, 3);
    puzzle.init();
};