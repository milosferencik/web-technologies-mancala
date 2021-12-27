const url = 'http://twserver.alunos.dcc.fc.up.pt:8008/'


// Join - join players to start game
// Returns a hash 'game' that acts as identifier
function join(group, nick, pass, size, initial) {
    return fetch(url + 'join', {method: 'POST',body: JSON.stringify({
        group: group, nick: nick, password: pass, size: size, initial: initial
    })})
    .then(response => response.json())
    .then(data => {
        console.log(data.game)
        return data.game;
    })
    .catch('Error:', console.log);
}

// Leave - give up unfinished game
function leave(nick, pass, game) {
    return fetch(url + 'leave', {method: 'POST', body: JSON.stringify({nick:nick, pass: pass, game: game})})
    .then(response => response.json())
    .then(data => {
        console.log(data.game)
    })
}
// Notify - notify server of a move
function notify(nick, pass, game) {
    return function() {
        fetch(url + 'notify', {method: 'POST', body: JSON.stringify({nick:nick, pass: pass, game: game})})
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
    }
}


// Ranking - appends data into leaderboard table
function ranking() {
    fetch(url + 'ranking', {method: 'POST', body: JSON.stringify({})})
    .then(response => response.json())
    .then(data => {
        // Set data int the leaderboard tab
        //[{nick, victories, games}, ...] 10 elements
        const arr = data.ranking
        var table = document.getElementById('leaderboardTable')
        
        for(let i = 1; i < 10; i++) {
            let newRow = table.insertRow(i);
            newRow.insertCell(0).innerText = arr[i].nick
            newRow.insertCell(1).innerText = arr[i].victories;
            newRow.insertCell(2).innerText = arr[i].games;
        }
    })
    .catch('Error:', console.log);
}

// Register - register user associated with password
function register(nick, pass, doIfRegistered, doIfNot) {
    console.log(nick)
    console.log(pass)
    fetch(url + 'register', {method: 'POST', body: JSON.stringify({nick: nick, password: pass})})
    .then(function(response) {
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
    // es.onopen = e => console.log("open ", e)
    es.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        // Winner response
        if (data.winner != undefined) {
            // Someone won - game is finished
            if (data.winner != null) {
                console.log(`Player ${data.winner} won`)
                //send data to server (points)
            }
            // Players tied
            else {
                console.log(`It is a tie`)
                //send data to server (points)
            }
            game = null
            es.close()
        }

        // Board response
        if (data.board != undefined) {
            console.log('opponent=',opponent)
            console.log(data.board)
            console.log(data.board.sides)
            var nicknames = new Array();
            var boardContent = new Array();
            for(var i in data.board.sides) {
                console.log(i)
                nicknames.push(data.board.sides[i])
                // opponent
                if (nick != i) {
                    opponentInfo = data.board.sides[i]
                    opponent = i
                }
                // current player
                if(nick == i) {
                    currentInfo = data.board.sides[i]
                }
            }

            const turn = data.board.turn
            // merge arrays into one (boardContent)
            for(var i in opponentInfo.pits) {
                boardContent.push(opponentInfo.pits[i])
            }
            boardContent.push(opponentInfo.store)
            for(var i in currentInfo.pits) {
                boardContent.push(currentInfo.pits[i])
            }
            boardContent.push(currentInfo.store)
            console.log(boardContent)           


            board = new Board(size, initial, boardContent)
            // {0:123, 1:321}
            console.log("nicknames");
            console.log(nicknames)
            game = new Game((nick == turn) ? 1 : 0 , 'remotePlayer',  size, initial, board, null, nicknames)


            // Hide "joinArea"
            document.getElementById("joinArea").style.display = "none"
            // Show the created board
            document.getElementById("player0").style.display = "flex"
            document.getElementById("board").style.display = "flex"
            document.getElementById("player1").style.display = "flex"
            document.getElementById("cancelGame").style.display = "flex"
            // Set text to player's actual nicknames
            document.getElementById("player0").innerText = opponent;
            document.getElementById("player1").innerText = nickname;


            console.log(game)
            // if it's this player's turn
            if(turn == nickname) {
                // Make a move by clicking ith tile
                // Update the board
                // Send information to the
            }

                        
        }
    }

    es.onerror = function(event) {
        console.log("SSE error " + event)
    }
    // es.close();
} 