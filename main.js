window.onload = function() {
    console.log("Loaded")

    //Register/log in a user
    let isSucess = false;
    // do {
        // const loginButton = document.getElementById('loginButton')
        // const nick = document.getElementById('nickField').value
        // const pass = document.getElementById('passField').value
        // isSuccess = loginButton.addEventListener('click', register(nick, pass))
        // if (isSucess) break;
    // } while(isSuccess)

    console.log('logged in :D')

    
    // Get leaderboard

    // document.getElementById('loginButton').addEventListener('click', join('37', 'nazwa', 'haslo', 6, 4));
    // document.getElementById('loginButton').addEventListener('click', leave(null, 'nazwa', 'haslo'));
    //group, nick, pass, size, initial

}

const loginButton = document.getElementById('loginButton')
loginButton.addEventListener('click', getInfo)

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