let settings = {
    numberOfHoles: 6,
    numberOfMarblesPerHoles: 4,
    startPlayer: 1,
    opponent: "computer",
    computerLevel: "begginer"
}

let playerName = {
    0: "Player 0",
    1: "Player 1"
}

let game;

window.onload = function() {
    // show default tab
    document.getElementById("defaultTab").click();
    // create game
    game = new Game(settings.startPlayer, settings.numberOfHoles, settings.numberOfMarblesPerHoles, settings.opponent, settings.computerLevel);
    
}

function startGame() {
    if(game != "undefined" && game.status == "started") {
        if (confirm('Are you sure you want to give up?')) {
            // TODO Save it to leaderbord!
          } else {
            return;
          }
    }
    // read and save values from settings
    settings.numberOfHoles = parseInt(document.getElementById("numberOfHoles").value);
    settings.numberOfMarblesPerHoles = parseInt(document.getElementById("numberOfMarblesPerHoles").value);
    settings.startPlayer = parseInt(document.querySelector('input[name="radioStartPlayer"]:checked').value);
    playerName[0] = document.getElementById("player0Name").value;
    playerName[1] = document.getElementById("player1Name").value;
    document.getElementById("player0").innerText = playerName[0];
    document.getElementById("player1").innerText = playerName[1];
    settings.opponent = document.getElementById("opponent").value;
    settings.computerLevel = document.getElementById("computerLevel").value;
    // create new game
    game = new Game(settings.startPlayer, settings.numberOfHoles, settings.numberOfMarblesPerHoles, settings.opponent, settings.computerLevel);
}

class Game {
    constructor(startPlayer, numberOfHoles, numberOfMarblesPerHoles, opponent, computerLevel) {
        // initialize game fields
        this.opponent = opponent;
        if (opponent == "computer") {
            this.computerAlgo = this.getComputerAlgo(computerLevel);
        }
        this.status = "initialized";
        this.currentPlayer = startPlayer;
        this.board = new Board(numberOfHoles, numberOfMarblesPerHoles, (opponent == "localPlayer"), this);

        writeMessage("Game is initialized. Player " + playerName[this.currentPlayer] + " starts the game.");
        // if the computer starts, let's call its computation
        if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
    }

    // play the hole with position pos
    play(pos) {
        // check 
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
        let end = this.board.checkEnd();
        if (end != 0) {
            // end the game
            this.endGame(end);
            return;
        }

        // check if player has another turn
        if (this.board.isPositionPlayersMancala(endPos, this.currentPlayer)) {
            writeMessage("Player " + playerName[this.currentPlayer] + " has another turn.");
            if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
            return
        }

        // change the player
        this.currentPlayer = (this.currentPlayer+1) % 2;
        writeMessage("Player " + playerName[this.currentPlayer] + " turn.");
        if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
    } 

    endGame() {
        // change the status
        this.status = "ended";
        // write message about the result
        if(this.board.getPlayersMarblesInMancala(0) > this.board.getPlayersMarblesInMancala(1)) {
            writeMessage("Game is over! The winner is " + playerName[0] + "!");

        } else if (this.board.getPlayersMarblesInMancala(0) == this.board.getPlayersMarblesInMancala(1)){
            writeMessage("Game is over! It is tie!");
        } else {
            writeMessage("Game is over! The winner is " + playerName[1] + "!");
        }
        //TODO write it to LeaderBoard
        //TODO start new game ?
    }

    // select correct algorithm for computer according to his level
    getComputerAlgo(computerLevel) {
        return this.beginnerAlgo;
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

}

class Board {
    constructor(numberOfHoles, numberOfMarblesPerHoles, allHolesClickable, game) {
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

        this.removeBoard();

        // create the board
        let index = 0;
        for (let player = 0; player<2; player++) {
            for(let i=0; i<numberOfHoles; i++) {
                // create the hole
                const parent = document.getElementById("row"+player.toString());
                let hole = document.createElement("div");
                hole.className = "hole"+player.toString();
                parent.appendChild(hole);
                
                // make holes of local players clickable
                if (allHolesClickable || index > numberOfHoles) {
                    // bind the game.play method on click
                    hole.onclick = ((fun,pos) => {
                        return () => fun(pos);
                    })(game.play.bind(game),index);
                }

                // add the marbles to hole
                const marbles = document.createElement("div");
                marbles.className = "marbles";
                hole.appendChild(marbles)
                marbles.innerText = numberOfMarblesPerHoles;
                this.board[index] = hole;
                this.content[index] = numberOfMarblesPerHoles;
                
                // increment the index
                index++;
            }
            // add the marbles to mancala
            const mancala = document.getElementById("mancala"+player.toString());
            const marbles = document.createElement("div");
            marbles.className = "marbles";
            mancala.appendChild(marbles);
            marbles.innerText = 0;
            this.board[index] = mancala;
            this.content[index] = 0;

            // increment the index
            index++;
        }
    }  

    isPlayersHole(player, pos) {
        return this.board[pos].className == "hole"+player.toString();
    }

    isHoleEmpty(pos) {
        return this.content[pos] == 0;
    }

    setMarblesOnPosition(pos, marbles) {
        this.content[pos] = marbles;
        this.board[pos].childNodes[0].innerText = marbles;
    }

    getPlayersMarblesInMancala(player) {
        return this.content[this.getMancalaPosition(player)];
    }

    getMarblesOnPosition(pos) {
        return this.content[pos];
    }

    getMancalaPosition(player) {
        if (player == 0) return this.numberOfHoles;
        return 2*this.numberOfHoles+1;
    }

    isPositionPlayersMancala(pos, player) {
        return pos == this.getMancalaPosition(player);
    }

    // returns position of next hole, skip opponent mancala
    getNextPosition(pos, currentPlayer) {
        const nextPos = ((currentPlayer == 1 && pos+1 == this.numberOfHoles) || (currentPlayer == 0 && pos+1 == 2*this.numberOfHoles+1)) ? pos+2  : pos+1;
        return nextPos % (2*this.numberOfHoles+2);
    }

    checkRules(pos, currentPlayer) {
        // check if the last marble is inserted to the empty current player's hole
        if (this.board[pos].className == "hole"+currentPlayer.toString() && this.content[pos] == 1) {
            // put the marble and the marbles from opposite hole to current player's mancala
            const currentPlayerPos = this.getMancalaPosition(currentPlayer);
            const oppositeHolePos = (2*this.numberOfHoles) - pos;
            this.content[currentPlayerPos] += this.content[pos] + this.content[oppositeHolePos];
            this.board[currentPlayerPos].childNodes[0].innerText = this.content[currentPlayerPos];
            this.content[pos] = 0;
            this.board[pos].childNodes[0].innerText = this.content[pos];
            this.content[oppositeHolePos] = 0;
            this.board[oppositeHolePos].childNodes[0].innerText = this.content[oppositeHolePos];
        }
    } 

    // returns 0 if the game continues and 1 if game is over
    checkEnd() {
        const sumMarblesInPlayerHoles = ((start, end) => {
            let sum = 0;
            for (let i=start; i<end; i++) {
                sum += this.content[i];
            }
            return sum;
        });
        
        // compute sum of marbles in player's holes
        const player0 = sumMarblesInPlayerHoles(0, this.numberOfHoles);
        const player1 = sumMarblesInPlayerHoles(this.numberOfHoles+1, 2*this.numberOfHoles+1);
        
        // check if each player has at least one marble in player's holes
        if (player0 != 0 && player1 != 0) return 0;
        
        // game is over, we add player's marbles from player's holes to player's mancala
        this.content[this.getMancalaPosition(0)] += player0;
        this.content[this.getMancalaPosition(1)] += player1;
        this.board[this.getMancalaPosition(0)].childNodes[0].innerText = this.content[this.getMancalaPosition(0)];
        this.board[this.getMancalaPosition(1)].childNodes[0].innerText = this.content[this.getMancalaPosition(1)];

        for (let i=0; i<2*this.numberOfHoles+2; i++) {
            if (i==this.getMancalaPosition(0) || i==this.getMancalaPosition(1)) continue;
            this.content[i] = 0;
            this.board[i].childNodes[0].innerText = 0;
        }
        return 1;
    }

    // return the position of hole where the last marble was inserted
    distributeMarbles(pos, marbles, currentPlayer) {
        while (marbles > 0) {
            pos = this.getNextPosition(pos, currentPlayer);
            // add marble to hole on position pos
            this.board[pos].childNodes[0].innerText = ++this.content[pos];
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
}

function openTab(evt, tabName) {
    let i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tabLinks");
    for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// write message into tab messages
function writeMessage(text) {
    let messagesContainer = document.getElementById("messagesContainer");
    let message = document.createElement("li");
    message.innerText = new Date().toLocaleTimeString() + "\t" + text;
    messagesContainer.insertBefore(message, messagesContainer.firstChild);
}