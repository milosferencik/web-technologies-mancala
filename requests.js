const url = 'http://twserver.alunos.dcc.fc.up.pt:8008/'


// Join - join players to start game
// group - your group's identifier (any string)
// nick - the user's nick
// password - the user's password
// size - the number of cavities by player
// initial - the number of initial seeds by cavity
// Returns a hash 'game' that acts as identifier
function join(group, nick, pass, size, initial) {
    fetch(url + 'join', {method: 'POST',body: JSON.stringify({
        group: group, nick: nick, password: pass, size: size, initial: initial
    })})
    .then(response => response.json())
    .then(data => {
        console.log(data.game)
        return data.game;
        // Call update
    })
    .catch('Error:', console.log);
}

// Leave - give up unfinished game      (nick, pass, game)
function leave(nick, pass, game) {
    return fetch(url + 'leave', {method: 'POST', body: JSON.stringify({nick:nick, pass: pass, game: game})})
    .then(response => response.json())
    .then(data => {
        console.log(data.game)
    })
}
// Notify - notify server of a move     (nick, pass, game, move)
function notify(nick, pass, game) {
    return function() {
        fetch(url + 'notify', {method: 'POST', body: JSON.stringify({nick:nick, pass: pass, game: game})})
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
    }
}


// Ranking - return leaderboard
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

// Register - register user associated with password    (nick, pass)
function register(nick, pass, doIfRegistered, doIfNot) {
    return function() {
        const nick = document.getElementById('nickField').value
        const pass = document.getElementById('passField').value
        console.log(nick)
        console.log(pass)
        fetch(url + 'register', {method: 'POST', body: JSON.stringify({nick: nick, password: pass})})
        .then(function(response) {
            if (response.ok) {
                console.log('User registered/logged in successfully')
                response.text().then(console.log);
                doIfRegistered();
            } else {
                console.log('Incorrect password')
                doIfNot();
            }
        })
        .catch(console.log);
    }
}

// Update (SSE, not XHR) - updates the game situation   (nick, game)
function update(nick, game) {
    const eventSource = new EventSource(url + 'update/'+'');
    eventSource.onmessage = function(event) {
        const data = JSON.parse(eventd.data);
        console.log(data)
    }
    eventSource.close();
}