let settings = {
    numberOfHoles: 6,
    numberOfMarblesPerHoles: 4,
    startPlayer: 1,
    opponent: "computer",
    computerLevel: 1
}

window.onload = function() {
    const board = new Board(settings.startPlayer, settings.numberOfHoles, settings.numberOfMarblesPerHoles);
}

class Board {
    constructor(startPlayer, numberOfHoles, numberOfMarblesPerHoles) {
        this.content = new Array(2*numberOfHoles+2);
        this.board = new Array(2*numberOfHoles+2);
        this.currentPlayer = startPlayer;
        this.numberOfHoles = numberOfHoles;

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
            console.log("Game is ower! The winner is Player 0!");
        } else if (this.content[this.getMancalaPos(0)] == this.content[this.getMancalaPos(1)]){
            console.log("Game is ower! It is tie!");
        } else {
            console.log("Game is ower! The winner is Player 1!");
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
            console.log("It is player " + this.currentPlayer.toString() + " turn!");
            return;
        } else if (this.content[pos] == 0) {
            console.log("You can not click on hole with zero marbles!");
            return;
        }

        const marbles = this.content[pos];
        this.content[pos] = 0;
        this.board[pos].childNodes[0].innerText = 0;
        const endPos = this.distributeMarbles(pos, marbles);
        this.checkEnd();
        this.currentPlayer = this.determineNextPlayer(endPos);

        console.log("Player " + this.currentPlayer.toString() + " turn.");
    } 
}