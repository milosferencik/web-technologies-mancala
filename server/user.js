const crypto = require('crypto');
const fs = require('fs');

var saveUsers = function(users) {
    fs.writeFile('data.json', JSON.stringify(users), err => {
        if (err) {
          console.error(err)
          return
        }
    });
}

var getUsers = function() {
    let data = fs.readFileSync('data.json');
    let users = JSON.parse(data);
    return users;
}

var getUser = function(nick) {
    let users = getUsers();
    return users.find(element => element.nick == nick);
}

var registerUser = function(nick, password) {
    let users = getUsers();
    let salt = crypto.randomBytes(16).toString('hex'); 
    let hash = crypto.pbkdf2Sync(password, salt, 100, 64, `sha512`).toString(`hex`);
    users.push({nick: nick, passwordHash: hash, salt: salt, victories: 0, games: 0});
    saveUsers(users);
}

var validateUser = function(user, password) {
    let hash = crypto.pbkdf2Sync(password, user.salt, 100, 64, `sha512`).toString(`hex`); 
    return user.passwordHash === hash;
}

module.exports.register = function(payload, response) {
    let nick = payload.nick;
    let password = payload.password;
    let user = getUser(nick);
    if (user == undefined) {
        registerUser(nick, password);
        response.writeHead(200);
        response.end("{}");
    } else {
        if (validateUser(user, password)) {
            response.writeHead(200);
            response.end("{}");
        } else {
            response.writeHead(401);
            response.end(JSON.stringify({error: "User registered with a different password"}))
        }
    }
}

module.exports.saveResult = function(playerNicks, winnerNick) {
    let users = getUsers();
    let players = [];
    playerNicks.forEach(nick => {
        players.push(users.find(element => element.nick == nick))
    });
    players.forEach(player =>{
        if (player != undefined) {
            player.games += 1;
            if (player.nick == winnerNick)
                player.victories += 1;
        }
    });
    saveUsers(users);
}

module.exports.ranking = function(response) {
    let users = getUsers();
    users.sort((a,b) => b.victories - a.victories);
    users.length = (users.length > 10) ? 10 : users.length;
    users.forEach(user => {
        delete user.passwordHash;
        delete user.salt;
    });

    response.writeHead(200);
    response.end('{"ranking": ' + JSON.stringify(users) + '}');
}

module.exports.validate = function(nick, password, response) {
    let user = getUser(nick);
    if (!validateUser(user, password)) {
        response.writeHead(401);
        response.end(JSON.stringify({error: "User registered with a different password"}))
        return false;
    }
    return true;
}