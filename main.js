var nickname
var password
var gameId
var joinArea

var size
var initial


window.onload = function() {
    console.log("Loaded")
    joinArea = document.getElementById('joinArea')
    document.getElementById("defaultTab").click();
    console.log(document.body.children[0])

    // GameArea invisible
    // joinArea.style.display = 'none';
    document.getElementById('player1').style.display = 'none';
    document.getElementById('player0').style.display = 'none';
    document.getElementById('board').style.display = 'none';

    //Register/log in a user
    const loginButton = document.getElementById('loginButton')
    loginButton.addEventListener('click', () => {
      nickname = document.getElementById('nickField').value
      password = document.getElementById('passField').value
      register(nickname, password, registeredSuccess, registeredFailed)
    })
}

// Function executed if user is registered successfully
function registeredSuccess() {
  console.log("Log in OK");
  
  document.getElementById('loginArea').style.display ="none";
  document.getElementById('errorMessage').style.display ="none";

  loginButton.addEventListener('click', ranking())
  
  // Join a game
  const startButton = document.getElementById('joinButton')
  startButton.addEventListener('click', () => {
    // group, nick. pass, size (number of cavities), initial (seeds per cavity)
    size = parseInt(document.getElementById("numberOfHoles").value)
    initial = parseInt(document.getElementById("numberOfMarblesPerHole").value);

    // Join
    join('37', nickname, password, size, initial).then((result) => {
      gameId = result
      update(nickname, gameId)
    })

    // Display game with indicated properties

  })
  

  // Leave game
  const cancelButton = document.getElementsByClassName('cancelButton')[0]
  cancelButton.addEventListener('click', () => {
    console.log('gameId=', gameId)
    // game, nick, password
    leave(gameId, nickname, password)
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

function getInfo() {
    console.log(document.getElementById('nickField').value)
    console.log(document.getElementById('passField').value)
    // return [document.getElementById('nickField'), document.getElementById('passField')]
}