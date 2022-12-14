let settings = {
    numberOfHoles: 6,
    numberOfMarblesPerHole: 4,
    startPlayer: 1,
    opponent: "computer",
    computerLevel: "advanced"
}

let playerName = {
    0: "Player 0",
    1: "Player 1"
}

function startGame() {
    if (cancelGame() != 0) {
        return;
    }
    // read and save values from settings
    settings.numberOfHoles = parseInt(document.getElementById("numberOfHoles").value);
    settings.numberOfMarblesPerHole = parseInt(document.getElementById("numberOfMarblesPerHole").value);
    settings.startPlayer = parseInt(document.querySelector('input[name="radioStartPlayer"]:checked').value);
    settings.opponent = document.getElementById("opponent").value;
    settings.computerLevel = document.getElementById("computerLevel").value; // [beginner, advanced]
    // create new game
    game = new LocalGame(settings.startPlayer, settings.numberOfHoles, settings.numberOfMarblesPerHole, settings.opponent, settings.computerLevel);
    game.setPlayersName({0: document.getElementById("player0Name").value, 1: document.getElementById("player1Name").value});
    showBoard();
}

function cancelGame() {
    if (game != undefined && game.status == "started") {
        if (!confirm('Are you sure you want to give up?')) return 1;
        // change status
        game.status = "ended";
        hideBoard();
        if (game instanceof RemoteGame)
            leave(nickname, password, gameId)
    }
    return 0;
}

class Game {
    constructor(numberOfHoles, numberOfMarblesPerHole) {
        this.status = "initialized";
        this.board = new Board(numberOfHoles, numberOfMarblesPerHole);
        this.playersName;
    }

    endGame() {
        // change the status
        this.status = "ended";
        // write message about the result
        // Current player won
        if (this.board.getPlayersMarblesInMancala(0) > this.board.getPlayersMarblesInMancala(1)) {
            writeMessage("Game is over! The winner is player " + playerName[0] + " with score " + this.board.getPlayersMarblesInMancala(0) + ":" + this.board.getPlayersMarblesInMancala(1));
        // It is a tie
        } else if (this.board.getPlayersMarblesInMancala(0) == this.board.getPlayersMarblesInMancala(1)) {
            writeMessage("Game is over! It is tie!");
        // Opponent won
        } else {
            writeMessage("Game is over! The winner is player " + playerName[1] + " with score " + this.board.getPlayersMarblesInMancala(1) + ":" + this.board.getPlayersMarblesInMancala(0));
        }
    }

    setPlayersName(playersName) {
        playerName = playersName;
        document.getElementById("player0").innerText = playerName[0];
        document.getElementById("player1").innerText = playerName[1];
    }
}

class RemoteGame extends Game {
    constructor(numberOfHoles, numberOfMarblesPerHole) {
        super(numberOfHoles, numberOfMarblesPerHole);
        this.board.initializeBoard(false, this);
        this.currentPlayer;
        writeMessage("Game is initialized. Waiting for opponent!");
    }

    play(pos) {
        if (this.status == "ended") {
            writeMessage("Game is over! Start new game!");
            return;
        } else if (this.status == "initialized" || this.currentPlayer == "undefined") {
            writeMessage("Waiting for opponent!");
            return;
        } else if (!this.board.isPlayersHole(this.currentPlayer, pos)) {
            writeMessage("Not your turn! It is " + playerName[this.currentPlayer] + " turn!");
            return;
        } else if (this.board.isHoleEmpty(pos)) {
            writeMessage("You can not click on hole with zero marbles!");
            return;
        }

        this.currentPlayer = getAnotherPlayer(this.currentPlayer);
        // server: notify the server about the move
        notify(nickname, password, gameId, pos - (this.board.numberOfHoles + 1))
    }
}

// local and AI
class LocalGame extends Game {
    constructor(startPlayer, numberOfHoles, numberOfMarblesPerHole, opponent, computerLevel) {
        // initialize game fields
        super(numberOfHoles, numberOfMarblesPerHole);
        this.opponent = opponent;
        if (opponent == "computer") this.computerAlgo = this.getComputerAlgo(computerLevel);
        this.currentPlayer = startPlayer;
        this.board.initializeBoard((opponent == "localPlayer"), this);

        writeMessage("Game is initialized. Player " + playerName[this.currentPlayer] + " starts the game.");
        // if the computer starts, let's call its computation
        if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
    }

    // play the hole with position pos
    play(pos) {
        // checks
        if (this.status == "ended") {
            writeMessage("Game is over! For new game go to Settings->Start!");
            return;
        } else if (!this.board.isPlayersHole(this.currentPlayer, pos)) {
            writeMessage("It is " + playerName[this.currentPlayer] + " turn!");
            return;
        } else if (this.board.isHoleEmpty(pos)) {
            writeMessage("You can not click on hole with zero marbles!");
            return;
        }
        // change status
        this.status = "started";

        // take marbles from hole and distribute them 
        const marbles = this.board.getMarblesOnPosition(pos);
        this.board.setMarblesOnPosition(pos, 0);
        const endPos = this.board.distributeMarbles(pos, marbles, this.currentPlayer);

        // check if the game is over
        const end = this.board.checkEnd();

        // render the board
        this.board.renderBoard();

        if (end != 0) {
            // end the game
            this.endGame();
            hideBoard();
            return;
        }

        // check if player has another turn
        if (this.board.isPositionPlayersMancala(endPos, this.currentPlayer)) {
            writeMessage("Player " + playerName[this.currentPlayer] + " has another turn.");
            if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
            return
        }

        // change the player
        this.currentPlayer = getAnotherPlayer(this.currentPlayer);
        writeMessage("Player " + playerName[this.currentPlayer] + " turn.");
        if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
    } 

    // select correct algorithm for computer according to his level
    getComputerAlgo(computerLevel) {
        if (computerLevel == "beginner") return this.beginnerAlgo;
        else return this.advancedAlgo;
    }

    // begginer algorithm which sellect random not empty hole
    beginnerAlgo(board) {
        let randomChoice;

        while (true) {
            // random hole index for comupter
            randomChoice = parseInt(Math.random() * board.numberOfHoles);
            // if chosen hole has marbles, choose it and break
            if (board.content[randomChoice] != 0) {
                // make computer choose that hole
                this.play(randomChoice);
                break;
            }
        }
    }

    // advance algorithm which sellect a hole according to some computation
    advancedAlgo() {
        // using minimax algo with depth 5
        let result = recursiveMove(0, this.board, 5);
        // computer play on the hole
        this.play(result[0]);
    }
}

class Board {
    constructor(numberOfHoles, numberOfMarblesPerHole, boardContent) {
        // holes indexing example
        //  3 2 1 0
        // 4       9
        //  5 6 7 8

        // intialize board fields
        // content contains the number of marbles in holes
        this.content = new Array(2*numberOfHoles+2);
        // board contains hole elements
        this.board = new Array(2*numberOfHoles+2);
        this.numberOfHoles = numberOfHoles;
        this.numberOfMarblesPerHole = numberOfMarblesPerHole

        for (let i = 0; i < this.content.length; i++) {
            this.content[i] = this.numberOfMarblesPerHole;
        }
        this.content[this.getMancalaPosition(0)] = 0;
        this.content[this.getMancalaPosition(1)] = 0;
    }   

    copy(other) {
        if (other instanceof Board) {
            this.content = other.content.slice();
        } else {
            console.log("Board.copy Warning try to copy from object which type is not Board!");
        }
    }

    isPlayersHole(player, pos) {
        return (player == 0 && pos >= 0 && pos < this.getMancalaPosition(0)) || (player == 1 && pos > this.getMancalaPosition(0) && pos < this.getMancalaPosition(1));
    }

    isHoleEmpty(pos) {
        return this.content[pos] == 0;
    }

    setMarblesOnPosition(pos, marbles) {
        this.content[pos] = marbles;
    }

    getPlayersMarblesInMancala(player) {
        return this.content[this.getMancalaPosition(player)];
    }

    getMarblesOnPosition(pos) {
        return this.content[pos];
    }

    getMancalaPosition(player) {
        if (player == 0) return this.numberOfHoles;
        return 2 * this.numberOfHoles + 1;
    }

    isPositionPlayersMancala(pos, player) {
        return pos == this.getMancalaPosition(player);
    }

    // returns position of next hole, skip opponent mancala
    getNextPosition(pos, currentPlayer) {
        const nextPos = ((currentPlayer == 1 && pos + 1 == this.getMancalaPosition(0)) || (currentPlayer == 0 && pos + 1 == this.getMancalaPosition(1))) ? pos + 2 : pos + 1;
        return nextPos % (2 * this.numberOfHoles + 2);
    }

    checkRules(pos, currentPlayer) {
        // check if the last marble is inserted to the empty current player's hole
        if (this.isPlayersHole(currentPlayer, pos) && this.content[pos] == 1) {
            // put the marble and the marbles from opposite hole to current player's mancala
            const currentPlayerPos = this.getMancalaPosition(currentPlayer);
            const oppositeHolePos = (2 * this.numberOfHoles) - pos;
            this.content[currentPlayerPos] += this.content[pos] + this.content[oppositeHolePos];
            this.content[pos] = 0;
            this.content[oppositeHolePos] = 0;
        }
    }

    // returns 0 if the game continues and 1 if game is over
    checkEnd() {
        const sumMarblesInPlayerHoles = ((start, end) => {
            let sum = 0;
            for (let i = start; i < end; i++) {
                sum += this.content[i];
            }
            return sum;
        });

        // compute sum of marbles in player's holes
        const player0 = sumMarblesInPlayerHoles(0, this.numberOfHoles);
        const player1 = sumMarblesInPlayerHoles(this.numberOfHoles + 1, 2 * this.numberOfHoles + 1);

        // check if each player has at least one marble in player's holes
        if (player0 != 0 && player1 != 0) return 0;

        // game is over, we add player's marbles from player's holes to player's mancala
        this.content[this.getMancalaPosition(0)] += player0;
        this.content[this.getMancalaPosition(1)] += player1;

        for (let i = 0; i < 2 * this.numberOfHoles + 2; i++) {
            if (i == this.getMancalaPosition(0) || i == this.getMancalaPosition(1)) continue;
            this.content[i] = 0;
        }
        return 1;
    }

    // return the position of hole where the last marble was inserted
    distributeMarbles(pos, marbles, currentPlayer) {
        while (marbles > 0) {
            pos = this.getNextPosition(pos, currentPlayer);
            // add marble to hole on position pos
            this.content[pos]++;
            marbles--;
        }
        this.checkRules(pos, currentPlayer);
        return pos;
    }

    // remove holes and mancala's marbles
    removeBoard() {
        document.querySelectorAll(".marbles").forEach(el => el.remove());
        document.querySelectorAll(".hole0").forEach(el => el.remove());
        document.querySelectorAll(".hole1").forEach(el => el.remove());
    }

    createBoard(allHolesClickable, game) {
        let index = 0;
        for (let player = 0; player <= 1; player++) {
            for (let i = 0; i < this.numberOfHoles; i++) {
                // create the hole
                const parent = document.getElementById("row" + player.toString());
                let hole = document.createElement("div");
                hole.className = "hole" + player.toString();
                parent.appendChild(hole);

                // make holes of local players clickable
                if (allHolesClickable || index > this.numberOfHoles) {
                    // bind the game.play method on click
                    hole.onclick = ((fun, pos) => {
                        return () => fun(pos);
                    })(game.play.bind(game), index);
                }

                // add the marbles to hole
                const marbles = document.createElement("div");
                marbles.className = "marbles";
                hole.appendChild(marbles)
                this.board[index] = hole;

                // increment the index
                index++;
            }
            // add the marbles to mancala
            const mancala = document.getElementById("mancala" + player.toString());
            const marbles = document.createElement("div");
            marbles.className = "marbles";
            mancala.appendChild(marbles);
            this.board[index] = mancala;

            // increment the index
            index++;
        }
    }

    renderBoard() {
        for (let i = 0; i < this.content.length; i++) {
            this.board[i].childNodes[0].innerText = this.content[i];
        }
    }

    initializeBoard(allHolesClickable, game) {
        this.removeBoard();
        this.createBoard(allHolesClickable, game);
        this.renderBoard();
    }

    updateBoard(boardContent) {
        this.content = boardContent;
        this.renderBoard();
    }
}

// returns position and the difference of computer's mancala and player's mancala
function recursiveMove(player, board, depth) {
    if (board.checkEnd() == 1 || depth == 0) {
        // the position here is not important
        return [0, board.getPlayersMarblesInMancala(0) - board.getPlayersMarblesInMancala(1)]
    }
    // decrease depth
    depth--;

    let holeIndex;
    let bestChoice, start, end;
    if (player == 0) {
        // settings for computer
        bestChoice = -2 * board.numberOfHoles * board.numberOfMarblesPerHole;
        start = 0;
        end = board.getMancalaPosition(0);
    } else {
        // settings for player 
        bestChoice = 2 * board.numberOfHoles * board.numberOfMarblesPerHole;
        start = board.getMancalaPosition(0) + 1;
        end = board.getMancalaPosition(1);
    }

    for (let i = start; i < end; i++) {
        // skip empty hole
        if (board.content[i] != 0) {
            // create new copy of board
            let newBoard = new Board(board.numberOfHoles, board.numberOfMarblesPerHole);
            newBoard.copy(board);

            // play game with hole i
            const endPos = advancedPlay(i, newBoard);;

            // get the next player
            const nextPlayer = board.isPositionPlayersMancala(endPos, player) ? player : getAnotherPlayer(player);

            // recursive call
            const result = recursiveMove(nextPlayer, newBoard, depth);

            // look for maximum or minimum according to player
            if ((player == 0 && result[1] >= bestChoice) || (player == 1 && result[1] <= bestChoice)) {
                bestChoice = result[1];
                holeIndex = i;
            }
        }
    }
    return [holeIndex, bestChoice];
}

function advancedPlay(pos, board) {
    const marbles = board.getMarblesOnPosition(pos);
    board.setMarblesOnPosition(pos, 0);
    return board.distributeMarbles(pos, marbles, 0);
}

function getAnotherPlayer(player) {
    return (player + 1) % 2;
}

function showBoard() {
    // Hide "joinArea"
    document.getElementById("joinArea").style.display = "none";
    // Show the created board
    document.getElementById("player0").style.display = "flex";
    document.getElementById("board").style.display = "flex";
    document.getElementById("player1").style.display = "flex";
    document.getElementById("cancelGame").style.display = "flex";
}

function hideBoard() {
     // Show "joinArea"
     document.getElementById("joinArea").style.display = "inline";
     // Show the created board
     document.getElementById("player0").style.display = "none";
     document.getElementById("board").style.display = "none";
     document.getElementById("player1").style.display = "none";
     document.getElementById("cancelGame").style.display = "none";
}