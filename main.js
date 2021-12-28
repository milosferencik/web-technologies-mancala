var nickname;
var password;
var gameId;
var joinArea;
var opponentRemote;
var game;

var size;
var initial;


window.onload = function() {
    joinArea = document.getElementById('joinArea')
    document.getElementById("defaultTab").click();

    // GameArea invisible
    document.getElementById('player1').style.display = 'none';
    document.getElementById('player0').style.display = 'none';
    document.getElementById('board').style.display = 'none';
    document.getElementById('cancelGame').style.display = 'none';

    // Register/log in a user
    const loginButton = document.getElementById('loginButton')
    loginButton.addEventListener('click', () => {
      nickname = document.getElementById('nickField').value
      password = document.getElementById('passField').value
      register(nickname, password, registeredSuccess, registeredFailed)
    })
}

// Function executed if user is registered successfully
function registeredSuccess() {
  document.getElementById('loginArea').style.display ="none";
  document.getElementById('errorMessage').style.display ="none";
  document.getElementById("nickname").innerHTML = nickname;

  loginButton.addEventListener('click', ranking())
  
  // Join a game
  const startButton = document.getElementById('joinButton')
  startButton.addEventListener('click', () => {
    size = parseInt(document.getElementById("numberOfHoles").value)
    initial = parseInt(document.getElementById("numberOfMarblesPerHole").value);

    // Join
    // group, nick. pass, size (number of cavities), initial (seeds per cavity)
    join('37', nickname, password, size, initial).then((result) => {
      gameId = result
      update(nickname, gameId)
    })

    // Display game with indicated properties
    game = new RemoteGame(size, initial);
    showBoard();
  })
}

// Function executed if user failed at /register
function registeredFailed() {
  console.log("Failed while logging in");
  document.getElementById('errorMessage').style.display ="inline";
}

function openTab(evt, tabName) {
    let i, tabContent, tabLinks;
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

// write message into tab messages
function writeMessage(text) {
    let messagesContainer = document.getElementById("messagesContainer");
    let message = document.createElement("p");
    message.innerHTML = new Date().toLocaleTimeString() + " &nbsp;&nbsp;" + text;
    messagesContainer.insertBefore(message, messagesContainer.firstChild);
}