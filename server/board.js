module.exports = class {
    constructor(numberOfHoles, numberOfMarblesPerHole) {
        // holes indexing example
        //  3 2 1 0
        // 4       9
        //  5 6 7 8

        // intialize board fields
        // content contains the number of marbles in holes
        this.content = new Array(2*numberOfHoles+2);
        this.numberOfHoles = numberOfHoles;
        this.numberOfMarblesPerHole = numberOfMarblesPerHole;

        for (let i = 0; i < this.content.length; i++) {
            this.content[i] = this.numberOfMarblesPerHole;
        }
        this.content[this.getMancalaPosition(0)] = 0;
        this.content[this.getMancalaPosition(1)] = 0;
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
}