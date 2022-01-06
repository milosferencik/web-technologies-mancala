const crypto = require('crypto');
const user = require("./user");
const board = require("./board");

const sseHeader = {    
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
    'Connection': 'keep-alive'
};

var games = [];

class Game {
    constructor(gameId, group, size, initial, nick) {
        this.gameId = gameId;
        this.group = group;
        this.size = size;
        this.initial = initial;
        this.board = new board(size, initial);
        this.currentPlayer = 0;
        this.nicks = [nick];
        this.responses = [];
    }

    addPlayer(nick) {
        this.nicks.push(nick);
    }
    
    addResponse(response) {
        this.responses.push(response);
    }

    getCurrentPlayerNick() {
        return this.nicks[this.currentPlayer];
    }

    getAnotherPlayer(player) {
        return (player + 1) % 2;
    }

    getWinnerNick() {
        if (this.board.getPlayersMarblesInMancala(0) > this.board.getPlayersMarblesInMancala(1))
            return this.nicks[0];
        if (this.board.getPlayersMarblesInMancala(0) == this.board.getPlayersMarblesInMancala(1))
            return null;
        return this.nicks[1];
    }

    createBoardResponse() {
        return {[this.nicks[0]]: {store: this.board.getPlayersMarblesInMancala(0), pits: this.board.content.slice(0, this.size)},
        [this.nicks[1]]: {store: this.board.getPlayersMarblesInMancala(1), pits: this.board.content.slice(this.size+1,2*this.size+1)}}
    }

    sendUpdateResponse(payload) {
        this.responses.forEach(response => {
            response.write('data: '+JSON.stringify(payload)+'\n\n');
        });
    }

    // play the hole with position pos
    play(pos) {
        // take marbles from hole and distribute them 
        const marbles = this.board.getMarblesOnPosition(pos);
        this.board.setMarblesOnPosition(pos, 0);
        const endPos = this.board.distributeMarbles(pos, marbles, this.currentPlayer);

        // check if the game is over
        if (this.board.checkEnd() != 0) {
            // game is over, send winner in update responce
            this.sendUpdateResponse({winner: this.getWinnerNick()});
            user.saveResult(this.nicks, this.getWinnerNick());
            // remove game from games
            removeGame(this.gameId);
            return;
        }

        // check if player has another turn
        if (!this.board.isPositionPlayersMancala(endPos, this.currentPlayer)) {
            // change the player
            this.currentPlayer = this.getAnotherPlayer(this.currentPlayer);
        }
        this.sendUpdateResponse({board:{sides: this.createBoardResponse(), turn: this.getCurrentPlayerNick()}});
    } 
}

var getGame = function(gameId) {
    return games.find(game => game.gameId === gameId);
}
var removeGame = function(gameId) {
    let i = games.findIndex(game => game.gameId === gameId);
    games.splice(i,1);
}

var generateGameId = function(group, size, initial) {
    const value = Date.now().toString(10) + group.toString(10) + size.toString(10) + initial.toString(10);
    return crypto.createHash('md5').update(value).digest('hex');
}

module.exports.join = function(payload, response) {
    // payload content: group	nick	password	size	initial
    // validate user
    if (!user.validate(payload.nick, payload.password)){
        return;
    }
    // find game with settings
    let game = games.find(game => 
        game.group === payload.group && 
        game.size == payload.size && 
        game.initial == payload.initial &&
        game.nicks.length == 1);
    if (game == undefined) {
        // create new game
        const gameId = generateGameId(payload.group, payload.size, payload.initial)
        game = new Game(gameId, payload.group, payload.size, payload.initial, payload.nick);
        games.push(game);
    } else {
        // add player to game, if he didn't create the game
        if(game.nicks[0] != payload.nick) {
            game.addPlayer(payload.nick);
        }
    }
    response.writeHead(200);
    response.end(JSON.stringify({game: game.gameId}));
}

module.exports.notify = function(payload, response) {
    // payload content: nick	password	game	move
    // validate user
    if (!user.validate(payload.nick, payload.password)){
        return;
    }
    // get game with gameId
    let game = getGame(payload.game);
    if (game == undefined) {
        response.writeHead(400);
        response.end(JSON.stringify({error: "Invalid game"}));
        return;
    }
    // check if it is player move
    if (payload.nick != game.getCurrentPlayerNick()) {
        response.writeHead(400);
        response.end(JSON.stringify({error: "Not your turn to play"}));
        return;
    }
    // validate move argument
    if (!Number.isInteger(payload.move) || payload.move < 0 || payload.move > this.size) {
        response.writeHead(400);
        response.end(JSON.stringify({error: "Invalid move"}));
        return;
    }
    // compute position on board
    let pos = payload.move + (game.size+1) * game.currentPlayer;
    // check if the hole is not empty
    if (game.board.isHoleEmpty(pos)) {
        response.writeHead(400);
        response.end(JSON.stringify({error: "Play on empty hole"}));
        return;
    }
    // make move
    game.play(pos);
    response.writeHead(200);
    response.end("{}");
}

module.exports.update = function(gameId, nick, response) {
    // find game and add response to game responses
    let game = getGame(gameId);
    if (game == undefined) {
        response.writeHead(400);
        response.end(JSON.stringify({error: "Invalid game reference"}));
        return;
    }
    game.addResponse(response);
    response.writeHead(200, sseHeader);
    // start the game when both players are connected
    if(game.responses.length == 2)
        game.sendUpdateResponse({board:{sides: game.createBoardResponse(), turn: game.getCurrentPlayerNick()}});
}

module.exports.leave = function(payload, response) {
    // payload content: game nick password
    // validate user
    if (!user.validate(payload.nick, payload.password)){
        return;
    }
    // check game argument
    let game = getGame(payload.game);
    if (game == undefined) {
        response.writeHead(400);
        response.end("Invalid game");
        return;
    }
    // set winner
    if (game.nicks.length > 1) {
        game.sendUpdateResponse({winner: game.nicks.find(nick => nick != payload.nick)});
        user.saveResult(game.nicks, game.nicks.find(nick => nick != payload.nick));
    }
    // remove game from games
    removeGame(payload.game);
    response.writeHead(200);
    response.end("{}");
}