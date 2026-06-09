class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.init();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Pièces noires
        board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        board[1] = Array(8).fill('p');
        
        // Pièces blanches
        board[6] = Array(8).fill('P');
        board[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        
        return board;
    }

    init() {
        this.renderBoard();
        this.setupEventListeners();
    }

    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceEmoji(piece);
                    square.classList.add('piece');
                }

                if (this.selectedSquare === `${row}-${col}`) {
                    square.classList.add('selected');
                }

                if (this.validMoves.some(m => m.row === row && m.col === col)) {
                    square.classList.add('valid-move');
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }

    getPieceEmoji(piece) {
        const emojis = {
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
        };
        return emojis[piece] || '';
    }

    handleSquareClick(row, col) {
        // Si une case est déjà sélectionnée et on clique ailleurs
        if (this.selectedSquare) {
            const [selRow, selCol] = this.selectedSquare.split('-').map(Number);

            // Si on clique sur le même élément, déselectionner
            if (selRow === row && selCol === col) {
                this.selectedSquare = null;
                this.validMoves = [];
                this.renderBoard();
                return;
            }

            // Vérifier si le mouvement est valide
            const isValidMove = this.validMoves.some(m => m.row === row && m.col === col);
            
            if (isValidMove) {
                this.movePiece(selRow, selCol, row, col);
                this.selectedSquare = null;
                this.validMoves = [];
                this.renderBoard();
                return;
            }

            // Sinon, sélectionner une nouvelle pièce
            if (this.board[row][col] && this.isOwnPiece(this.board[row][col])) {
                this.selectedSquare = `${row}-${col}`;
                this.validMoves = this.getValidMoves(row, col);
                this.renderBoard();
            }
        } else {
            // Première sélection
            if (this.board[row][col] && this.isOwnPiece(this.board[row][col])) {
                this.selectedSquare = `${row}-${col}`;
                this.validMoves = this.getValidMoves(row, col);
                this.renderBoard();
            }
        }
    }

    isOwnPiece(piece) {
        if (this.currentPlayer === 'white') {
            return piece === piece.toUpperCase();
        } else {
            return piece === piece.toLowerCase();
        }
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];

        if (!piece) return moves;

        const type = piece.toUpperCase();
        const isWhite = piece === piece.toUpperCase();

        switch (type) {
            case 'P':
                moves.push(...this.getPawnMoves(row, col, isWhite));
                break;
            case 'R':
                moves.push(...this.getRookMoves(row, col, isWhite));
                break;
            case 'N':
                moves.push(...this.getKnightMoves(row, col, isWhite));
                break;
            case 'B':
                moves.push(...this.getBishopMoves(row, col, isWhite));
                break;
            case 'Q':
                moves.push(...this.getQueenMoves(row, col, isWhite));
                break;
            case 'K':
                moves.push(...this.getKingMoves(row, col, isWhite));
                break;
        }

        return moves;
    }

    getPawnMoves(row, col, isWhite) {
        const moves = [];
        const direction = isWhite ? -1 : 1;
        const newRow = row + direction;

        if (newRow >= 0 && newRow < 8 && !this.board[newRow][col]) {
            moves.push({ row: newRow, col });

            // Mouvement initial de deux cases
            const startRow = isWhite ? 6 : 1;
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Captures
        for (let newCol of [col - 1, col + 1]) {
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (target && target === target.toUpperCase() !== isWhite) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
    }

    getBishopMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
    }

    getQueenMoves(row, col, isWhite) {
        return this.getSlidingMoves(row, col, isWhite, [
            [0, 1], [0, -1], [1, 0], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]);
    }

    getSlidingMoves(row, col, isWhite, directions) {
        const moves = [];
        for (const [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;

            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else if (target === target.toUpperCase() !== isWhite) {
                    moves.push({ row: newRow, col: newCol });
                    break;
                } else {
                    break;
                }
                newRow += dRow;
                newCol += dCol;
            }
        }
        return moves;
    }

    getKnightMoves(row, col, isWhite) {
        const moves = [];
        const positions = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dRow, dCol] of positions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const target = this.board[newRow][newCol];
                if (!target || target === target.toUpperCase() !== isWhite) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        return moves;
    }

    getKingMoves(row, col, isWhite) {
        const moves = [];
        for (let dRow = -1; dRow <= 1; dRow++) {
            for (let dCol = -1; dCol <= 1; dCol++) {
                if (dRow === 0 && dCol === 0) continue;

                const newRow = row + dRow;
                const newCol = col + dCol;

                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = this.board[newRow][newCol];
                    if (!target || target === target.toUpperCase() !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        return moves;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        // Enregistrer la capture
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
            this.updateCapturedPieces();
        }

        // Effectuer le mouvement
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Enregistrer le coup
        this.recordMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece);

        // Changement de joueur
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updatePlayerInfo();
    }

    recordMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece) {
        const fromPos = this.coordsToAlgebraic(fromRow, fromCol);
        const toPos = this.coordsToAlgebraic(toRow, toCol);
        const capture = capturedPiece ? 'x' : '';
        const moveNotation = `${piece}${fromPos}${capture}${toPos}`;

        this.moveHistory.push(moveNotation);
        this.updateMovesList();
    }

    coordsToAlgebraic(row, col) {
        return String.fromCharCode(97 + col) + (8 - row);
    }

    updatePlayerInfo() {
        const playerText = this.currentPlayer === 'white' ? 'Blanc à jouer' : 'Noir à jouer';
        document.getElementById('currentPlayer').textContent = playerText;
    }

    updateMovesList() {
        const movesList = document.getElementById('movesList');
        movesList.innerHTML = '';
        this.moveHistory.forEach(move => {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            moveItem.textContent = move;
            movesList.appendChild(moveItem);
        });
        movesList.scrollTop = movesList.scrollHeight;
    }

    updateCapturedPieces() {
        const whiteCaptures = document.getElementById('whiteCaptures');
        const blackCaptures = document.getElementById('blackCaptures');

        whiteCaptures.textContent = this.capturedPieces.white.map(p => this.getPieceEmoji(p)).join(' ');
        blackCaptures.textContent = this.capturedPieces.black.map(p => this.getPieceEmoji(p)).join(' ');
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.renderBoard();
        this.updatePlayerInfo();
        this.updateMovesList();
        this.updateCapturedPieces();
    }

    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }
}

// Initialiser le jeu au chargement
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});