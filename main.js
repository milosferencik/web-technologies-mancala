window.onload = function() {
    console.log("Loaded")
    document.getElementById("defaultTab").click();
    console.log(document.body.children[0])

    //Register/log in a user
    const loginButton = document.getElementById('loginButton')
    const nick = document.getElementById('nickField').value
    const pass = document.getElementById('passField').value
    loginButton.addEventListener('click', register(nick, pass, registeredSuccess, registeredFailed))
}

// Function executed if user is registered successfully
function registeredSuccess() {
  console.log("Registered/Logged in successfully");
  const nickname = document.getElementById('nickField').value
  const password = document.getElementById('passField').value
  
  document.getElementById('loginArea').style.display ="none";
  document.getElementById('errorMessage').style.display ="none";

  loginButton.addEventListener('click', ranking())
  
  // Start game
  const startButton = document.getElementsByClassName('startButton')[0]
  startButton.addEventListener('click', () => {
    // group, nick. pass, size (number of cavities), initial (seeds per cavity)
    const size = parseInt(document.getElementById("numberOfHoles").value)
    const initial = parseInt(document.getElementById("numberOfMarblesPerHole").value);

    join('37', nickname, password, size, initial).then((result) => console.log(result))
  })

  // Leave game
  const cancelButton = document.getElementsByClassName('cancelButton')[0]
  cancelButton.addEventListener('click', () => {
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