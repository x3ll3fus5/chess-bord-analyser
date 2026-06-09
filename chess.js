class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        // Suivi des mouvements pour le roque
        this.kingMoved = { white: false, black: false };
        this.rookMoved = { white: { left: false, right: false }, black: { left: false, right: false } };
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
        
        // Mouvements normaux du roi
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

        // Roque (castling)
        moves.push(...this.getCastlingMoves(row, col, isWhite));

        return moves;
    }

    // Vérifie si une case est attaquée par l'adversaire
    isSquareAttacked(row, col, byWhite) {
        // Vérifier toutes les pièces adverses
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (!piece) continue;
                
                const isWhite = piece === piece.toUpperCase();
                // Si la pièce n'appartient pas à l'attaquant, passer
                if (isWhite !== byWhite) continue;

                const type = piece.toUpperCase();

                // Vérifier si cette pièce peut attaquer la case (row, col)
                switch (type) {
                    case 'P':
                        if (this.pawnAttacks(r, c, row, col, isWhite)) return true;
                        break;
                    case 'N':
                        if (this.knightAttacks(r, c, row, col)) return true;
                        break;
                    case 'B':
                        if (this.bishopAttacks(r, c, row, col)) return true;
                        break;
                    case 'R':
                        if (this.rookAttacks(r, c, row, col)) return true;
                        break;
                    case 'Q':
                        if (this.queenAttacks(r, c, row, col)) return true;
                        break;
                    case 'K':
                        if (this.kingAttacks(r, c, row, col)) return true;
                        break;
                }
            }
        }
        return false;
    }

    pawnAttacks(fromRow, fromCol, toRow, toCol, isWhite) {
        const direction = isWhite ? -1 : 1;
        return fromRow + direction === toRow && Math.abs(fromCol - toCol) === 1;
    }

    knightAttacks(fromRow, fromCol, toRow, toCol) {
        const dRow = Math.abs(fromRow - toRow);
        const dCol = Math.abs(fromCol - toCol);
        return (dRow === 2 && dCol === 1) || (dRow === 1 && dCol === 2);
    }

    bishopAttacks(fromRow, fromCol, toRow, toCol) {
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    rookAttacks(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    queenAttacks(fromRow, fromCol, toRow, toCol) {
        return this.bishopAttacks(fromRow, fromCol, toRow, toCol) || 
               this.rookAttacks(fromRow, fromCol, toRow, toCol);
    }

    kingAttacks(fromRow, fromCol, toRow, toCol) {
        return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const dRow = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const dCol = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
        
        let r = fromRow + dRow;
        let c = fromCol + dCol;
        
        while (r !== toRow || c !== toCol) {
            if (this.board[r][c]) return false;
            r += dRow;
            c += dCol;
        }
        return true;
    }

    getCastlingMoves(row, col, isWhite) {
        const moves = [];
        const player = isWhite ? 'white' : 'black';
        
        // Le roi ne doit pas avoir bougé
        if (this.kingMoved[player]) return moves;

        // Le roi doit être à sa position initiale
        const kingRow = isWhite ? 7 : 0;
        if (row !== kingRow || col !== 4) return moves;

        // Le roi ne peut pas être en échec
        if (this.isSquareAttacked(row, col, !isWhite)) return moves;

        // Roque petit (côté roi) - déplacement vers la droite
        if (!this.rookMoved[player].right) {
            if (!this.board[kingRow][5] && !this.board[kingRow][6]) {
                const rook = this.board[kingRow][7];
                if (rook && rook.toUpperCase() === 'R' && rook === rook.toUpperCase() === isWhite) {
                    // Vérifier que les cases f1/f8, g1/g8 et h1/h8 ne sont pas attaquées
                    if (!this.isSquareAttacked(kingRow, 5, !isWhite) && 
                        !this.isSquareAttacked(kingRow, 6, !isWhite) &&
                        !this.isSquareAttacked(kingRow, 7, !isWhite)) {
                        moves.push({ row: kingRow, col: 6, castling: 'kingside' });
                    }
                }
            }
        }

        // Roque grand (côté dame) - déplacement vers la gauche
        if (!this.rookMoved[player].left) {
            if (!this.board[kingRow][3] && !this.board[kingRow][2] && !this.board[kingRow][1]) {
                const rook = this.board[kingRow][0];
                if (rook && rook.toUpperCase() === 'R' && rook === rook.toUpperCase() === isWhite) {
                    // Vérifier que les cases d1/d8, c1/c8 et a1/a8 ne sont pas attaquées
                    if (!this.isSquareAttacked(kingRow, 3, !isWhite) && 
                        !this.isSquareAttacked(kingRow, 2, !isWhite) &&
                        !this.isSquareAttacked(kingRow, 0, !isWhite)) {
                        moves.push({ row: kingRow, col: 2, castling: 'queenside' });
                    }
                }
            }
        }

        return moves;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        const isWhite = piece === piece.toUpperCase();
        const player = isWhite ? 'white' : 'black';
        
        // Trouver le mouvement pour vérifier si c'est un roque
        const castlingMove = this.validMoves.find(m => m.row === toRow && m.col === toCol && m.castling);

        // Enregistrer la capture
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
            this.updateCapturedPieces();
        }

        // Effectuer le mouvement normal
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Gérer le roque
        if (castlingMove) {
            if (castlingMove.castling === 'kingside') {
                // Petit roque - la tour se déplace de h à f
                this.board[toRow][5] = this.board[toRow][7];
                this.board[toRow][7] = null;
                this.recordMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece, 'O-O');
            } else if (castlingMove.castling === 'queenside') {
                // Grand roque - la tour se déplace de a à d
                this.board[toRow][3] = this.board[toRow][0];
                this.board[toRow][0] = null;
                this.recordMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece, 'O-O-O');
            }
            
            // Marquer le roi et la tour comme ayant bougé
            this.kingMoved[player] = true;
            if (castlingMove.castling === 'kingside') {
                this.rookMoved[player].right = true;
            } else {
                this.rookMoved[player].left = true;
            }
        } else {
            // Mouvements normaux
            if (piece.toUpperCase() === 'K') {
                this.kingMoved[player] = true;
            }
            if (piece.toUpperCase() === 'R') {
                if (fromCol === 0) this.rookMoved[player].left = true;
                if (fromCol === 7) this.rookMoved[player].right = true;
            }
            
            this.recordMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
        }

        // Changement de joueur
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updatePlayerInfo();
    }

    recordMove(fromRow, fromCol, toRow, toCol, piece, capturedPiece, notation = null) {
        if (notation) {
            // Roque
            this.moveHistory.push(notation);
        } else {
            const fromPos = this.coordsToAlgebraic(fromRow, fromCol);
            const toPos = this.coordsToAlgebraic(toRow, toCol);
            const capture = capturedPiece ? 'x' : '';
            const moveNotation = `${piece}${fromPos}${capture}${toPos}`;
            this.moveHistory.push(moveNotation);
        }
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
        this.kingMoved = { white: false, black: false };
        this.rookMoved = { white: { left: false, right: false }, black: { left: false, right: false } };
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
