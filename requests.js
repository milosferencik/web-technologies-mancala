const url = 'http://twserver.alunos.dcc.fc.up.pt:8008/'


// Join - join players to start game
// group - your group's identifier (any string)
// nick - the user's nick
// password - the user's password
// size - the number of cavities by player
// initial - the number of initial seeds by cavity
// Returns a hash 'game' that acts as identifier
function join(group, nick, pass, size, initial) {
    return function() {
        fetch(url + 'join', {method: 'POST',body: JSON.stringify({
            group: group, nick: nick, pass: pass, size: size, initial: initial
        })})
        .then(response => response.json())
        .then(data => {
            console.log(data)
            // returns a 'game'
            return createHash(group+nick+pass+size+initial)
        })
        .catch('Error:', console.log);
    }
}

// Leave - give up unfinished game      (nick, pass, game)
function leave(nick, pass, game) {
    return function() {
        fetch(url + 'leave', {method: 'POST', body: JSON.stringify({nick:nick, pass: pass, game: game})})
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
    }
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
// Returns an array of [nick, victories, games]
function ranking() {
    return function() {
        fetch(url + 'ranking', {method: 'POST', body: JSON.stringify({})})
        .then(response => response.json())
        .then(data => {
            const arr = data.ranking
            return arr;
        })
        .catch('Error:', console.log);
    }
}

// Register - register user associated with password    (nick, pass)
function register(nick, pass) {
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
            } else {
                console.log('Incorrect password')
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


function createHash(inputString) {
    var hash = 0;
    if (inputString.length == 0) return 0;

    for(let i = 0; i < inputString.length; i++) {
        char = inputString.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash &= hash
    }
    return hash
}