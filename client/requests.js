// const url = 'http://twserver.alunos.dcc.fc.up.pt:8008/'
const url = 'http://twserver.alunos.dcc.fc.up.pt:8137/'


// Join - join players to start game
// Returns a hash 'game' that acts as identifier
function join(group, nick, pass, size, initial) {
    return fetch(url + 'join', {
        method: 'POST', body: JSON.stringify({
            group: group, nick: nick, password: pass, size: size, initial: initial
        })
    })
        .then(response => response.json())
        .then(data => {
            return data.game;
        })
        .catch('Error:', console.log);
}

// Leave - give up unfinished game
function leave(nick, pass, game) {
    return fetch(url + 'leave', { method: 'POST', body: JSON.stringify({ nick: nick, password: pass, game: game }) })
        .then(response => response.json())
        .then(data => {
            console.log(data.game)
        })
}
// Notify - notify server of a move
function notify(nick, pass, game, move) {
    fetch(url + 'notify', {
        method: 'POST',
        body: JSON.stringify({ nick: nick, password: pass, game: game, move: move })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Notify:', data)
        })
}


// Ranking - appends data into leaderboard table
function ranking() {
    fetch(url + 'ranking', { method: 'POST', body: JSON.stringify({}) })
        .then(response => response.json())
        .then(data => {
            // Set data int the leaderboard tab
            //[{nick, victories, games}, ...] 10 elements
            const arr = data.ranking;
            var table = document.getElementById('leaderboardTable');
            var rowCount = table.rows.length;
            for (var i = 1; i < rowCount; i++) {
                table.deleteRow(1);
            }
            for (let i = 0; i < arr.length; i++) {
                let newRow = table.insertRow(i+1);
                newRow.insertCell(0).innerText = arr[i].nick;
                newRow.insertCell(1).innerText = arr[i].victories;
                newRow.insertCell(2).innerText = arr[i].games;
            }
        })
        .catch('Error:', console.log);
}

// Register - register user associated with password
function register(nick, pass, doIfRegistered, doIfNot) {
    fetch(url + 'register', { method: 'POST', body: JSON.stringify({ nick: nick, password: pass }) })
        .then(function (response) {
            if (response.ok) {
                response.text().then(console.log);
                doIfRegistered();
            } else {
                console.log('Incorrect password')
                doIfNot();
            }
        })
        .catch(console.log);
}

// Update - updates the game situation
function update(nick, gameId) {
    const es = new EventSource(url + `update?nick=${nick}&game=${gameId}`);
    es.onmessage = function (event) {
        const data = JSON.parse(event.data);
        openTab(event, 'messagesTab')

        // Winner response
        if (data.winner != undefined) {
            // Someone won - game is finished
            if (data.winner != null) {
                writeMessage("Game is over! The winner is player " + data.winner + "!");
            }
            // Players tied
            else {
                writeMessage("Game is over! It is tie!");
            }
            game = null;
            es.close();
            hideBoard();
            return;
        }

        // Board response
        if (data.board != undefined) {
            if (game.status == "initialized") {
                game.status = "started";
                const keys = Object.keys(data.board.sides);
                game.setPlayersName(nick == keys[0] ? keys.reverse() : keys)
            }

            var boardContent = new Array();
            for (var i in data.board.sides) {
                // opponent
                if (nick != i) 
                    opponentInfo = data.board.sides[i];
                // current player
                if (nick == i)
                    currentInfo = data.board.sides[i];
            }
            
            // merge arrays into one (boardContent)
            for (var i in opponentInfo.pits) {
                boardContent.push(opponentInfo.pits[i])
            }
            boardContent.push(opponentInfo.store)
            for (var i in currentInfo.pits) {
                boardContent.push(currentInfo.pits[i])
            }
            boardContent.push(currentInfo.store)

            game.currentPlayer = (nick == data.board.turn) ? 1 : 0;
            game.board.updateBoard(boardContent);
            writeMessage("It is Player " + data.board.turn + " turn.");
        }
    }

    es.onerror = function (event) {
        console.log("SSE error " + event)
    }
}