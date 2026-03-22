/* Minimal Tic-Tac-Toe game module (vanilla JS)
   Usage: TicTacToe.init(containerElement)
*/
(function (global) {
    const SESSION_KEY = "vosHeistCurrentUser";
    const GAME_KEY = "tictactoe";
    const WIN_LINES = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function createBoardEl() {
        const board = document.createElement('div');
        board.className = 'ttt-board';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'ttt-cell';
            cell.setAttribute('data-index', String(i));
            cell.setAttribute('aria-label', `cell ${i + 1}`);
            board.appendChild(cell);
        }
        return board;
    }

    function createControlsEl() {
        const wrap = document.createElement('div');
        wrap.className = 'ttt-controls';
        const status = document.createElement('div');
        status.className = 'ttt-status';
        status.textContent = 'X starts';
        const btns = document.createElement('div');
        btns.className = 'ttt-btns';
        const reset = document.createElement('button');
        reset.className = 'btn btn-sm btn-outline-secondary ttt-reset';
        reset.textContent = 'Reset';
        btns.appendChild(reset);
        wrap.appendChild(status);
        wrap.appendChild(btns);
        return { wrap, status, reset };
    }

    function checkWinner(board) {
        for (const line of WIN_LINES) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], line };
            }
        }
        if (board.every(Boolean)) return { winner: null, line: null, draw: true };
        return null;
    }

    function initGame(container) {
        container.innerHTML = '';
        container.classList.add('ttt-container');

        const boardEl = createBoardEl();
        const controls = createControlsEl();
        container.appendChild(boardEl);
        container.appendChild(controls.wrap);

        const leaderboard = document.createElement('div');
        leaderboard.className = 'game-leaderboard mt-2';
        leaderboard.innerHTML = `
            <h2 class="h6 mb-1">Tic Tac Toe Leaderboard</h2>
            <ol class="game-score-list mb-1"></ol>
            <small class="text-secondary game-score-note"></small>
        `;
        const scoreList = leaderboard.querySelector('.game-score-list');
        const scoreNote = leaderboard.querySelector('.game-score-note');
        container.appendChild(leaderboard);

        let board = Array(9).fill(null);
        let current = 'X';
        let running = true;
        let wins = 0;

        async function refreshLeaderboard() {
            if (!global.vosHeistApi || typeof global.vosHeistApi.getGameScores !== 'function') {
                scoreList.innerHTML = '<li>API unavailable</li>';
                scoreNote.textContent = '';
                return;
            }
            try {
                const payload = await global.vosHeistApi.getGameScores(GAME_KEY);
                const rows = Array.isArray(payload.scores) ? payload.scores : [];
                scoreList.innerHTML = rows.length
                    ? rows.slice(0, 8).map((row) => {
                        const name = row.nickname || row.displayName || row.userKey || 'Player';
                        return `<li><span>${name}</span><strong>${row.score}</strong></li>`;
                    }).join('')
                    : '<li>No scores yet</li>';
                scoreNote.textContent = sessionStorage.getItem(SESSION_KEY)
                    ? 'Wins against the computer are tracked.'
                    : 'Log in to publish your score.';
            } catch {
                scoreList.innerHTML = '<li>Could not load scores</li>';
                scoreNote.textContent = '';
            }
        }

        async function submitWins() {
            if (wins <= 0) return;
            const userKey = sessionStorage.getItem(SESSION_KEY);
            if (!userKey || !global.vosHeistApi || typeof global.vosHeistApi.submitGameScore !== 'function') return;
            try {
                await global.vosHeistApi.submitGameScore(GAME_KEY, { userKey, score: wins });
                await refreshLeaderboard();
            } catch {
                // Ignore leaderboard submission failures.
            }
        }

        function render() {
            const cells = boardEl.querySelectorAll('.ttt-cell');
            cells.forEach((cell) => {
                const idx = Number(cell.getAttribute('data-index'));
                cell.textContent = board[idx] || '';
                // Player is X, computer is O
                cell.disabled = !running || Boolean(board[idx]) || current === 'O';
            });
        }

        function endGame(result) {
            running = false;
            if (result && result.winner) {
                controls.status.textContent = result.winner === 'X' ? 'You win!' : 'Computer wins!';
                if (result.winner === 'X') {
                    wins += 1;
                    submitWins();
                }
                for (const i of result.line) {
                    const el = boardEl.querySelector(`.ttt-cell[data-index="${i}"]`);
                    if (el) el.classList.add('ttt-win');
                }
            } else if (result && result.draw) {
                controls.status.textContent = 'Draw';
            }
            render();
        }

        function cpuTurn() {
            if (!running || current !== 'O') return;
            const empty = board
                .map((value, index) => (value ? -1 : index))
                .filter((index) => index >= 0);
            if (!empty.length) return;

            const i = empty[Math.floor(Math.random() * empty.length)];
            board[i] = 'O';
            const res = checkWinner(board);
            if (res) return endGame(res);
            current = 'X';
            controls.status.textContent = "Your turn";
            render();
        }

        boardEl.addEventListener('click', (ev) => {
            const t = ev.target;
            if (!t || !t.classList.contains('ttt-cell')) return;
            const i = Number(t.getAttribute('data-index'));
            if (!running || board[i] || current !== 'X') return;

            board[i] = 'X';
            const res = checkWinner(board);
            if (res) return endGame(res);

            current = 'O';
            controls.status.textContent = 'Computer thinking...';
            render();
            setTimeout(cpuTurn, 260);
        });

        controls.reset.addEventListener('click', () => {
            board = Array(9).fill(null);
            current = 'X';
            running = true;
            controls.status.textContent = 'You start';
            boardEl.querySelectorAll('.ttt-cell').forEach((c) => c.classList.remove('ttt-win'));
            render();
        });

        // initial render
        refreshLeaderboard();
        render();
        return {
            getState: () => ({ board: board.slice(), current, running })
        };
    }

    global.TicTacToe = {
        init(container) {
            if (!container) return null;
            return initGame(container);
        }
    };
})(window);
