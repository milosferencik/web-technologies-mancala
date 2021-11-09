let settings = {
    numberOfHoles: 2,
    numberOfMarblesPerHoles: 4,
    startPlayer: 1,
    opponent: "computer",
    computerLevel: 1
}

let playerName = {
    0: "Player 0",
    1: "Player 1"
}

window.onload = function() {
    document.getElementById("defaultTab").click();
    startGame();
}

// class Game {
//     constructor() {
//         this.board = new Board(settings.startPlayer, settings.numberOfHoles, settings.numberOfMarblesPerHoles);
//         this.status = "start";

//     }
// }
class Board {
    constructor(startPlayer, numberOfHoles, numberOfMarblesPerHoles) {
        this.content = new Array(2*numberOfHoles+2);
        this.board = new Array(2*numberOfHoles+2);
        this.currentPlayer = startPlayer;
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
                })(this.play.bind(this),index);
        
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
        writeMessage("It is " + playerName[this.currentPlayer] + " turn!");
    }  

    getMancalaPos(player) {
        if (player == 0) return this.numberOfHoles;
        return 2*this.numberOfHoles+1;
    }

    isCurrentPlayerMancala(pos) {
        return pos == this.getMancalaPos(this.currentPlayer);
    }

    nextPosition(pos) {
        const nextPos = ((this.currentPlayer == 1 && pos+1 == this.numberOfHoles) || (this.currentPlayer == 0 && pos+1 == 2*this.numberOfHoles+1)) ? pos+2  : pos+1;
        return nextPos % (2*this.numberOfHoles+2);
    }

    checkRules(pos) {
        if (this.board[pos].className == "hole"+this.currentPlayer.toString() && this.content[pos] == 1) {
            const currentPlayerPos = this.getMancalaPos(this.currentPlayer);
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
        
        if (player0 != 0 && player1 != 0) return;
        
        this.content[this.getMancalaPos(0)] += player0;
        this.content[this.getMancalaPos(1)] += player1;
        this.board[this.getMancalaPos(0)].childNodes[0].innerText = this.content[this.getMancalaPos(0)];
        this.board[this.getMancalaPos(1)].childNodes[0].innerText = this.content[this.getMancalaPos(1)];

        for (let i=0; i<2*this.numberOfHoles+2; i++) {
            if (i==this.getMancalaPos(0) || i==this.getMancalaPos(1)) continue;
            this.content[i] = 0;
            this.board[i].childNodes[0].innerText = 0;
        }

        if(this.content[this.getMancalaPos(0)] > this.content[this.getMancalaPos(1)]) {
            writeMessage("Game is ower! The winner is " + playerName[0] + "!");

        } else if (this.content[this.getMancalaPos(0)] == this.content[this.getMancalaPos(1)]){
            writeMessage("Game is ower! It is tie!");
        } else {
            writeMessage("Game is ower! The winner is " + playerName[1] + "!");
        }
    }

    determineNextPlayer(endPos) {
        if (this.isCurrentPlayerMancala(endPos)) {
            return this.currentPlayer;
        }
        return (this.currentPlayer+1) % 2;
    }

    distributeMarbles(pos, marbles) {
        while (marbles > 0) {
            pos = this.nextPosition(pos);
            this.board[pos].childNodes[0].innerText = ++this.content[pos];
            marbles--;
        }
        this.checkRules(pos);
        return pos;
    }

    play(pos) {
        if (this.board[pos].className != "hole"+this.currentPlayer.toString()) {
            writeMessage("It is " + playerName[this.currentPlayer] + " turn!");
            return;
        } else if (this.content[pos] == 0) {
            writeMessage("You can not click on hole with zero marbles!");
            return;
        }

        console.log(this.content);

        const marbles = this.content[pos];
        this.content[pos] = 0;
        this.board[pos].childNodes[0].innerText = 0;
        const endPos = this.distributeMarbles(pos, marbles);
        this.checkEnd();
        this.currentPlayer = this.determineNextPlayer(endPos);

        writeMessage("Player " + playerName[this.currentPlayer] + " turn.");
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
    const board = new Board(settings.startPlayer, settings.numberOfHoles, settings.numberOfMarblesPerHoles);
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