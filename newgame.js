const startButton = document.getElementById("startButton-el"),
    opponentInputEl = document.getElementById("opponentInput-el"),
    locationEl = document.getElementById("location-el"),
    domoClientIdEl = document.getElementById("domoClientId-el"),
    domoClientSecretEl = document.getElementById("domoClientSecret-el")

let creds = {
    id: "",
    secret: "",
}

opponentInputEl.addEventListener("keyup", function() {
    checkInput()
})

locationEl.addEventListener("keyup", function() {
    checkInput()
})

domoClientSecretEl.addEventListener("keyup", function() {
    checkInput()
})

domoClientIdEl.addEventListener("keyup", function() {
    checkInput()
})


startButton.addEventListener("click", function() {
    let game = {
        date: formatDate(),
        opponent: "",
        location: "",
        faceOffsWon: 0,
        faceOffsLost: 0,
        totalFaceOffs: 0,
        winPercent: 0,
        gbsWon: 0,
        gbsLost: 0,
    }
    game.opponent = opponentInputEl.value
    game.location = locationEl.value
    creds.id = domoClientIdEl.value
    creds.secret = domoClientSecretEl.value
    localStorage.setItem("game", JSON.stringify(game))
    localStorage.setItem("Domo", JSON.stringify(creds))
    window.location.href = "index.html"
})

function formatDate() {
    var d = new Date(),
        month = '' + (d.getUTCMonth() + 1),
        day = '' + d.getUTCDate(),
        year = d.getUTCFullYear(),
        hour = d.getUTCHours(),
        min = d.getUTCMinutes(),
        sec = d.getUTCSeconds()
    
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('/') + " " + [hour, min, sec].join(':')
}

function checkInput() {
    if (opponentInputEl.value !== '' && locationEl.value !== '' && domoClientIdEl.value !== '' && domoClientSecretEl.value !== '') {
        startButton.classList.remove("buttonDisabled")
        startButton.disabled = false
    } else {
        startButton.classList.add("buttonDisabled")
        startButton.disabled = true
    }
}

function getDomoCreds() {
    let ls = localStorage.getItem("Domo")
    if (ls) {
        creds = JSON.parse(ls)
        domoClientIdEl.value = creds.id
        domoClientSecretEl.value = creds.secret
        domoClientIdEl.style.display = "none"
        domoClientSecretEl.style.display = "none"
        }

}

getDomoCreds()




        
