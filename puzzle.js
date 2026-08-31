class Puzzle
{
    constructor(rows = 6, cols = 6, draggingDistance, matchCount, targetScore, timeLimit)
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
        this.effectColor = '#9932cc';

        this.board = [];
        
        this.targetScore = targetScore;
        this.score = 0;
        this.combo = 0;

        this.matchCount = matchCount;

        // カウントダウンの変数
        this.timeLimit = timeLimit;
        this.timer = 100;
        this.timerInterval = null;

        // コンボの猶予時間のカウントダウン
        this.comboGraceTime = 2;
        this.comboTimer = 0;

        this.isSwap = true;
        this.isGameActive = true;

        // スライド判定のpx数
        this.draggingDistance = draggingDistance;

        this.startTile = null; // クリックしたタイル情報を保存
        this.startX = 0;
        this.startY = 0;
        this.isDragging = false;

        this.init();

        this.sendScore();
        this.sendCombo();
        this.sendTime();
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
        this.timerCount();

        window.addEventListener('mousemove', (e) => this.dragMove(e));
        window.addEventListener('touchmove', (e) => this.dragMove(e), {passive: false});

        window.addEventListener('mouseup', () => this.dragEnd());
        window.addEventListener('touchend', () => this.dragEnd());
    }

    selectColors()
    {
        return Math.floor(Math.random() * this.COLORS.length) + 1
    }

    // 初期配置色がで揃わないようにする関数
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
        if(!this.isGameActive || !this.isSwap)
        {
            return;
        }
        const tempId = this.board[r1][c1];
        this.board[r1][c1] = this.board[r2][c2];
        this.board[r2][c2] = tempId;

        this.updateBoardColor();

        // 入れ替えた後に揃っているかをチェックする
        this.checkMatches();
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
                        tile.style.backgroundImage = 'linear-gradient(45deg, #757575 0%, #9E9E9E 45%, #E8E8E8 70%, #9E9E9E 85%, #757575 90% 100%)';
                        setTimeout(() => {
                            tile.style.backgroundImage = 'none';
                            tile.style.backgroundColor = 'transparent'; //透明にする
                        }, 100);
                    }
                    else
                    {
                        tile.style.backgroundColor = this.COLORS[colorId - 1];
                        tile.style.backgroundImage = 'none';
                    }
                }
            }
        }
    }

    checkMatches()
    {
        const groups = this.splitMatches(this.findMatches());
        const groupsLen = groups.length;
        const finalCombo = this.combo + groupsLen;

        // 揃っている部分が無ければリターン
        if(groupsLen === 0)
        {
            this.jugeGameClear();
            this.isSwap = true;
            this.comboTimer = this.timer - this.comboGraceTime;
            return;
        }

        this.isSwap = false;

        groups.forEach(group => { 
            setTimeout(() => {
                this.comboTimer = this.timer - this.comboGraceTime;
                // スコア加算
                this.combo++;
                this.sendCombo();
                if(this.combo <= finalCombo)
                {
                    this.score += group.length * 10 * this.combo;
                }
                this.sendScore();
                if(this.targetScore <= this.score)
                {
                    this.isGameActive = false;
                    clearInterval(this.timerInterval);
                }

                // 揃っていれば消去する座標に0を入れる　
                for(const id of group)
                {
                    this.board[id.r][id.c] = 0;
                }
                this.updateBoardColor();

                setTimeout(() => {
                    this.dropTiles();
                    this.generateTiles();
                    this.updateBoardColor();
                    this.checkMatches();
                }, 300);
            }, 300);
        })
        this.comboTimer = this.timer - this.comboGraceTime;
    }

    // matchedが引数になる中身は座標[r][c]とカラーが入っている
    splitMatches(matchMap)
    {
        const visited = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(false));
        const groups = [];

        for(let r = 0; r < this.ROWS; r++)
        {
            for(let c = 0; c < this.COLS; c++)
            {
                // 消えるマスかつ未調査のマスなら
                if(matchMap[r][c] && !visited[r][c])
                {
                    const group = [];
                    const queue = [{ r, c }];
                    visited[r][c] = true;

                    const targetColorId = this.board[r][c];

                    // 隣り合う消えるマスを探す
                    while(0 < queue.length)
                    {
                        // 今から見るマスをリストの先頭から値を取り出す
                        const curr = queue.shift();
                        // グループのスタートを挿入
                        group.push(curr);

                        // 上下左右をチェック
                        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                        for(const [dr, dc] of directions)
                        {
                            const nr = curr.r + dr;
                            const nc = curr.c + dc;

                            // 盤面の範囲内かチェック
                            if(0 <= nr && nr < this.ROWS && 0 <= nc && nc < this.COLS)
                            {
                                // 消えるマスかつ未調査のマスなら
                                if(matchMap[nr][nc] && !visited[nr][nc] && targetColorId === this.board[nr][nc])
                                {
                                    visited[nr][nc] = true;
                                    queue.push({ r: nr, c: nc });
                                }
                            }
                        }
                    }
                    groups.push(group);
                }
            }
        }
        return groups;
    }

    // 揃っている部分があるか判定
    findMatches()
    {
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
        return matchMap;
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

    jugeGameClear()
    {
        if(this.targetScore <= this.score)
        {
            const gameClear = document.getElementById('game-clear');   
            gameClear.classList.remove('hidden');
        }
    }

    jugeTimeOver()
    {
        if(this.timer <= 0)
        {
            // カウントダウンを止める
            clearInterval(this.timerInterval);
            this.isGameActive = false;
            const timeOver = document.getElementById('time-over');   
            timeOver.classList.remove('hidden');
        }
    }

    sendScore()
    {
        const event = new CustomEvent('sendScore', { detail: {score:this.score}})
        window.dispatchEvent(event);
    }

    sendCombo()
    {
        const event = new CustomEvent('sendCombo', { detail: {combo:this.combo}})
        window.dispatchEvent(event);
    }

    sendTime()
    {
        const event = new CustomEvent('sendTime', { detail: {time:this.timer}})
        window.dispatchEvent(event);   
    }

    // 制限時間をカウントダウン
    timerCount()
    {
        this.timer = this.timeLimit;

        // 1秒ごとにカウントダウン
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.sendTime();
            this.hasComboTime();
            this.jugeTimeOver();
        }, 1000);
    }

    // コンボ猶予時間判定(猶予時間を超えたらコンボ数を0に戻す)
    hasComboTime()
    {
        if(this.timer <= this.comboTimer)
        {
            this.combo = 0;
            this.sendCombo();
        }
    }
}