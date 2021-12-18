const getBtn = document.getElementById('defaultTab');

const xhr = new XMLHttpRequest()
const url = 'http://twserver.alunos.dcc.fc.up.pt:8008/'

/*
Returns a leaderboard with a maximum of 10 players, sorted in descending order
of the number of wins. It has no arguments.
*/ 
const ranking = () => {
    const xhr = new XMLHttpRequest();
    fetch(url+'ranking', { method: 'POST', body: '{"nothing": "nothing"}' })
    .then(console.log)
    .catch(console.log);
};

getBtn.addEventListener('click', ranking);
