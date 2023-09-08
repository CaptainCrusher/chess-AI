
var board,
    game = new Chess();
console.log("initializing recursive searching")
/*The "AI" part starts here */

var minimaxRoot =function(depth, game, isMaximisingPlayer) {

    var newGameMoves = game.ugly_moves();
    var bestMove = -9999;
    var bestMoveFound;

    for(var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.ugly_move(newGameMove);
        var value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer, 0);
        game.undo();
        if(value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    return bestMoveFound;
};

var minimax = function (depth, game, alpha, beta, isMaximisingPlayer, time) {
    positionCount++;
    if (depth === 0) {
        return -evaluateBoard(game.board());
    }
    

    var newGameMoves = game.ugly_moves();

    if (isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            game.set_turn((game.turn() === 'w' ? 'b' : 'w'));
            var king = game.in_check()
            var queen = game.queen_check()
            game.set_turn((game.turn() === 'w' ? 'b' : 'w'));
            if (!(newGameMoves[i].captured === null && !queen && !king) || i === 0) {
                bestMove = Math.max(bestMove, minimax(depth - (time > 8 || i === 0 ? 1 : 0), game, alpha, beta, !isMaximisingPlayer, time + 1));
            }
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.ugly_move(newGameMoves[i]);
            game.set_turn((game.turn() === 'w' ? 'b' : 'w'));
            var king = game.in_check()
            var queen = game.queen_check()
            game.set_turn((game.turn() === 'w' ? 'b' : 'w'));
            bestMove = Math.min(bestMove, minimax(depth - ((newGameMoves[i].captured === null && !king && !queen) || time > 8 ? 1 : 0), game, alpha, beta, !isMaximisingPlayer, time + 1));
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        return bestMove;
    }
};

/*var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
        }
    }
    return totalEvaluation;
};*/

var convertIntToPos = function(int) {
    var xPos = int % 16;
    var yPos = (int-xPos)/16;
    return {x: xPos, y: yPos};
};

console.log("board analysis beginning")

var evaluateBoard = function(board) {
    var totalEval = 0;
    var sqUsefulness = [
        [-2,-1, 0, 0, 0, 0,-1,-2],
        [ 0, 0, 0, 1, 1, 0, 0, 0],
        [ 0, 1, 1, 2, 2, 1, 1, 0],
        [ 0, 1, 1, 5, 5, 1, 1, 0],
        [ 0, 1, 2, 5, 5, 2, 1, 0],
        [ 0, 1, 2, 5, 5, 2, 1, 0],
        [ 1, 2, 3, 4, 4, 3, 2, 1],
        [ 2, 3, 4, 5, 5, 4, 3, 2]
    ];
    var pieceScopeVals = {
        "k":-0.005,
        "q": 0.005,
        "r": 0.008,
        "b": 0.015,
        "n": 0.010,
        "p": 0.017
    };
    var boardVals = [];
    for (var i = 0; i < 8; i += 1) {
        boardVals.push([]);
        for (var j = 0; j < 8; j += 1) {
            boardVals[boardVals.length-1].push(0);
        }
    }
    game.set_turn('b')
    var newGameMoves = game.area_covered();
    for (var i = 0; i < newGameMoves.length; i += 1) {
        var pos = convertIntToPos(newGameMoves[i].to);
        totalEval -= sqUsefulness[pos.y][pos.x] * pieceScopeVals[newGameMoves[i].piece];
    }
    game.set_turn('w')
    var newGameMoves = game.area_covered();
    for (var i = 0; i < newGameMoves.length; i += 1) {
        var pos = convertIntToPos(newGameMoves[i].to);
        totalEval += sqUsefulness[pos.y][pos.x] * pieceScopeVals[newGameMoves[i].piece];
    }
    //console.log(boardVals)
    for (var col = 0; col < boardVals.length; col += 1) {
        for (var row = 0; row < boardVals[col].length; row += 1) {
            /*if (boardVals[col][row] > 0) {
                totalEval += (sqUsefulness[col][row]/30);
            }
            else if (boardVals[col][row] < 0) {
                totalEval -= (sqUsefulness[7-col][row]/30);
            }*/
            totalEval += getPieceValue(board[col][row], col, row);
        }
    }
    return totalEval;
};

var evaluateProgression = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getGameProgression(board[i][j], i, j);
        }
    }
    return totalEvaluation;
};

var reverseArray = function(array) {
    return array.slice().reverse();
};

var pawnEvalWhite =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.0,  2.0,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  5.0,  5.0, -2.0,  0.0,  0.0],
        [0.5, -0.5, -1.0, -1.0, -1.0, -2.0, -0.5,  0.5],
        [0.5,  1.0,  1.0, -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval =
    [
        [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
        [-0.4, -0.2,  0.0,  0.0,  0.0,  0.0, -0.2, -0.4],
        [-0.3,  0.0,  0.1,  0.1,  0.1,  0.1,  0.0, -0.3],
        [-0.3,  0.0,  0.1,  0.2,  0.2,  0.1,  0.0, -0.3],
        [-0.3,  0.0,  0.1,  0.2,  0.2,  0.1,  0.0, -0.3],
        [-0.3,  0.0,  0.1,  0.1,  0.1,  0.1,  0.0, -0.3],
        [-0.4, -0.2,  0.0,  0.0,  0.0,  0.0, -0.2, -0.4],
        [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5]
    ];

var bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  0.0,  0.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  2.0,  3.0,  3.0,  3.0,  3.0,  2.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,  0.0,  1.0,  2.5,  2.5,  1.0,  0.0,  0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0, -1.0, -1.0, -1.0, -1.0,  2.0,  2.0 ],
    [  2.0,  5.0,  5.0, -1.0, -0.5,  5.0,  5.0,  2.0 ]
];

var kingEvalBlack = reverseArray(kingEvalWhite);


console.log("starting piece values")

var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isWhite, x, y) {
        if (piece.type === 'p') {
            return 1 + (endGame ? (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x])/5 : 0);
        } else if (piece.type === 'r') {
            return 5/* + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] )*/;
        } else if (piece.type === 'n') {
            return 3/* + knightEval[y][x]*2*/;
        } else if (piece.type === 'b') {
            return 3/* + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] )*/;
        } else if (piece.type === 'q') {
            return 9/* + evalQueen[y][x]/3*/;
        } else if (piece.type === 'k') {
            return 900/* + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] )/5*/;
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

var getGameProgression = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isWhite, x, y) {
        if (piece.type === 'p') {
            return 1;
        } else if (piece.type === 'r') {
            return 5;
        } else if (piece.type === 'n') {
            return 3;
        } else if (piece.type === 'b') {
            return 3;
        } else if (piece.type === 'q') {
            return 9;
        } else if (piece.type === 'k') {
            return 0;
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
    return absoluteValue;
};


/* board visualization and games state handling */

var onDragStart = function (source, piece, position, orientation) {
    if (game.in_checkmate() === true || game.in_draw() === true ||
        piece.search(/^b/) !== -1) {
        return false;
    }
};

endGame = false
var makeBestMove = function () {
    if (endGame === false && evaluateProgression(game.board()) < 30) {
        endGame = true
        console.log("initiating endgame strategy")
        pawnEvalWhite =
            [
                [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
                [6.0,  6.0,  6.0,  6.0,  6.0,  6.0,  6.0,  6.0],
                [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
                [4.0,  4.0,  4.0,  4.0,  4.0,  4.0,  4.0,  4.0],
                [3.0,  3.0,  3.0,  3.0,  3.0,  3.0,  3.0,  3.0],
                [2.0,  2.0,  2.0,  2.0,  2.0,  2.0,  2.0,  2.0],
                [1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0],
                [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
            ];

        pawnEvalBlack = reverseArray(pawnEvalWhite);

        knightEval =
            [
                [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5],
                [-0.4, -0.2,  0.0,  0.0,  0.0,  0.0, -0.2, -0.4],
                [-0.3,  0.0,  0.1,  0.1,  0.1,  0.1,  0.0, -0.3],
                [-0.3,  0.0,  0.1,  0.2,  0.2,  0.1,  0.0, -0.3],
                [-0.3,  0.0,  0.1,  0.2,  0.2,  0.1,  0.0, -0.3],
                [-0.3,  0.0,  0.1,  0.1,  0.1,  0.1,  0.0, -0.3],
                [-0.4, -0.2,  0.0,  0.0,  0.0,  0.0, -0.2, -0.4],
                [-0.5, -0.4, -0.3, -0.3, -0.3, -0.3, -0.4, -0.5]
            ];

        bishopEvalWhite = [
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
        ];

        bishopEvalBlack = reverseArray(bishopEvalWhite);

        rookEvalWhite = [
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
            [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
        ];

        rookEvalBlack = reverseArray(rookEvalWhite);

        evalQueen = [
            [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
            [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
            [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
            [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
            [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
            [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
            [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
            [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
        ];

        kingEvalWhite = [

            [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
            [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
            [  0.0,  1.0,  2.0,  2.0,  2.0,  2.0,  1.0,  0.0],
            [  0.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  0.0],
            [  0.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  0.0],
            [  0.0,  1.0,  2.0,  2.0,  2.0,  2.0,  1.0,  0.0],
            [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0 ],
            [ -1.0, -1.0,  0.0,  0.0,  0.0,  0.0, -1.0, -1.0 ]
        ];

        kingEvalBlack = reverseArray(kingEvalWhite);
    }
    var bestMove = getBestMove(game);
    game.ugly_move(bestMove);
    board.position(game.fen());
    renderMoveHistory(game.history());
    if (game.game_over()) {
        alert('Game over');
    }
};

console.log("AI setup complete")
var positionCount;
var getBestMove = function (game) {
    if (game.game_over()) {
        alert('Game over');
    }

    positionCount = 0;
    var depth = parseInt($('#search-depth').find(':selected').text());

    var d = new Date().getTime();
    var bestMove = minimaxRoot(depth, game, true);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    return bestMove;
};

var renderMoveHistory = function (moves) {
    var historyElement = $('#move-history').empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);

};

var onDrop = function (source, target) {

    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    removeGreySquares();
    if (move === null) {
        return 'snapback';
    }

    renderMoveHistory(game.history());
    window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function () {
    board.position(game.fen());
};

var onMouseoverSquare = function(square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
};

var removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9a9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
};
board = ChessBoard('board', cfg);
