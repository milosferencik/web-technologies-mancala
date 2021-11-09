let settings = {
    numberOfHoles: 2,
    numberOfMarblesPerHoles: 4,
    startPlayer: 1,
    opponent: "Computer",
    computerLevel: "Begginer"
}

let playerName = {
    0: "Player 0",
    1: "Player 1"
}

window.onload = function() {
    document.getElementById("defaultTab").click();
    startGame();
}

class Game {
    constructor(startPlayer, numberOfHoles, numberOfMarblesPerHoles, opponent, computerLevel) {
        this.opponent = opponent;
        if (opponent == "computer") {
            console.log("computer is playing")
            this.computerAlgo = this.getComputerAlgo(computerLevel);
        }
        this.status = "initialized";
        this.currentPlayer = startPlayer;
        this.board = new Board(numberOfHoles, numberOfMarblesPerHoles, this);
        writeMessage("Player " + playerName[this.currentPlayer] + " turn.");
    }

    play(pos) {
        if (!this.board.isPlayersHole(this.currentPlayer, pos)) {
            writeMessage("It is " + playerName[this.currentPlayer] + " turn!");
            return;
        } else if (this.board.isHoleEmpty(pos)) {
            writeMessage("You can not click on hole with zero marbles!");
            return;
        }
        this.status = "started";

        const marbles = this.board.getMarblesOnPosition(pos);
        this.board.setMarblesOnPosition(pos, 0);
        const endPos = this.board.distributeMarbles(pos, marbles, this.currentPlayer);
        let end = this.board.checkEnd();
        if (end != 0) {
            this.endGame(end);
            return;
        }
        if (this.board.isPlayerMancala(endPos, this.currentPlayer)) {
            writeMessage("Player " + playerName[this.currentPlayer] + " has another turn.");
            if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
            return
        }

        this.currentPlayer = (this.currentPlayer+1) % 2;
        writeMessage("Player " + playerName[this.currentPlayer] + " turn.");
        if (this.opponent == "computer" && this.currentPlayer == 0) this.computerAlgo(this.board);
    } 

    endGame() {
        this.status = "ended";
        if(this.board.getPlayersMarblesInMancala(0) > this.board.getPlayersMarblesInMancala(1)) {
            writeMessage("Game is ower! The winner is " + playerName[0] + "!");

        } else if (this.board.getPlayersMarblesInMancala(0) == this.board.getPlayersMarblesInMancala(1)){
            writeMessage("Game is ower! It is tie!");
        } else {
            writeMessage("Game is ower! The winner is " + playerName[1] + "!");
        }
        //TODO write it to LeaderBoard
        //TODO start new game ?
    }

    getComputerAlgo(computerLevel) {
        return this.beginnerAlgo;
    }

    beginnerAlgo(board) {
        let computerRange = board.numberOfHoles; // number of holes per player
        while (true) {
            let randomChoice = parseInt(Math.random() * computerRange); // random hole index for comupter
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
    constructor(numberOfHoles, numberOfMarblesPerHoles, game) {
        this.content = new Array(2*numberOfHoles+2);
        this.board = new Array(2*numberOfHoles+2);
        this.numberOfHoles = numberOfHoles;

        this.removeBoard();

        let index = 0;
        for (let player = 0; player<2; player++) {
            for(let i=0; i<numberOfHoles; i++) {
                const parent = document.getElementById("row"+player.toString());
                let hole = document.createElement("div");
                hole.className = "hole"+player.toString();
                parent.appendChild(hole);
                const marbles = document.createElement("div");
                marbles.className = "marbles";
                hole.appendChild(marbles)
        
                hole.onclick = ((fun,pos) => {
                    return () => fun(pos);
                })(game.play.bind(game),index);
        
                marbles.innerText = numberOfMarblesPerHoles;
                this.board[index] = hole;
                this.content[index++] = numberOfMarblesPerHoles;
            }
            const mancala = document.getElementById("mancala"+player.toString());
            const marbles = document.createElement("div");
            marbles.className = "marbles";
            mancala.appendChild(marbles);
            marbles.innerText = 0;
            this.board[index] = mancala;
            this.content[index++] = 0;
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
        return this.content[this.getMancalaPos(player)];
    }

    getMarblesOnPosition(pos) {
        return this.content[pos];
    }

    getMancalaPos(player) {
        if (player == 0) return this.numberOfHoles;
        return 2*this.numberOfHoles+1;
    }

    isPlayerMancala(pos, player) {
        return pos == this.getMancalaPos(player);
    }

    nextPosition(pos, currentPlayer) {
        const nextPos = ((currentPlayer == 1 && pos+1 == this.numberOfHoles) || (currentPlayer == 0 && pos+1 == 2*this.numberOfHoles+1)) ? pos+2  : pos+1;
        return nextPos % (2*this.numberOfHoles+2);
    }

    checkRules(pos, currentPlayer) {
        if (this.board[pos].className == "hole"+currentPlayer.toString() && this.content[pos] == 1) {
            const currentPlayerPos = this.getMancalaPos(currentPlayer);
            const oppositeHolePos = (2*this.numberOfHoles) - pos;
            this.content[currentPlayerPos] += this.content[pos] + this.content[oppositeHolePos];
            this.board[currentPlayerPos].childNodes[0].innerText = this.content[currentPlayerPos];
            this.content[pos] = 0;
            this.board[pos].childNodes[0].innerText = this.content[pos];
            this.content[oppositeHolePos] = 0;
            this.board[oppositeHolePos].childNodes[0].innerText = this.content[oppositeHolePos];
        }
    } 

    checkEnd() {
        const sumMarblesInPlayerHoles = ((start, end) => {
            let sum = 0;
            for (let i=start; i<end; i++) {
                sum += this.content[i];
            }
            return sum;
        });
        
        const player0 = sumMarblesInPlayerHoles(0, this.numberOfHoles);
        const player1 = sumMarblesInPlayerHoles(this.numberOfHoles+1, 2*this.numberOfHoles+1);
        
        if (player0 != 0 && player1 != 0) return 0;
        
        this.content[this.getMancalaPos(0)] += player0;
        this.content[this.getMancalaPos(1)] += player1;
        this.board[this.getMancalaPos(0)].childNodes[0].innerText = this.content[this.getMancalaPos(0)];
        this.board[this.getMancalaPos(1)].childNodes[0].innerText = this.content[this.getMancalaPos(1)];

        for (let i=0; i<2*this.numberOfHoles+2; i++) {
            if (i==this.getMancalaPos(0) || i==this.getMancalaPos(1)) continue;
            this.content[i] = 0;
            this.board[i].childNodes[0].innerText = 0;
        }
        return 1;
    }

    distributeMarbles(pos, marbles, currentPlayer) {
        while (marbles > 0) {
            pos = this.nextPosition(pos, currentPlayer);
            this.board[pos].childNodes[0].innerText = ++this.content[pos];
            marbles--;
        }
        this.checkRules(pos, currentPlayer);
        return pos;
    }

    
    removeBoard() {
        document.querySelectorAll(".marbles").forEach(el => el.remove());
        document.querySelectorAll(".hole0").forEach(el => el.remove());
        document.querySelectorAll(".hole1").forEach(el => el.remove());
    }
}

function startGame() {
    settings.numberOfHoles = parseInt(document.getElementById("numberOfHoles").value);
    settings.numberOfMarblesPerHoles = parseInt(document.getElementById("numberOfMarblesPerHoles").value);
    settings.startPlayer = parseInt(document.querySelector('input[name="radioStartPlayer"]:checked').value);
    playerName[0] = document.getElementById("player0Name").value;
    playerName[1] = document.getElementById("player1Name").value;
    document.getElementById("player0").innerText = playerName[0];
    document.getElementById("player1").innerText = playerName[1];
    settings.opponent = document.getElementById("opponent").value;
    settings.computerLevel = document.getElementById("computerLevel").value;
    console.log(settings.opponent);
    console.log(settings.computerLevel);
    const game = new Game(settings.startPlayer, settings.numberOfHoles, settings.numberOfMarblesPerHoles, settings.opponent, settings.computerLevel);
}

function openTab(evt, tabName) {
    var i, tabContent, tabLinks;
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

function writeMessage(text) {
    let messagesContainer = document.getElementById("messagesContainer");
    let message = document.createElement("p");
    message.innerText = text;
    messagesContainer.appendChild(message);
}