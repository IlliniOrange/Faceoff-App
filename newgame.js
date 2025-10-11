const startButton = document.getElementById("startButton-el"),
    opponentInputEl = document.getElementById("opponentInput-el"),
    locationEl = document.getElementById("location-el"),
    domoClientIdEl = document.getElementById("domoClientId-el"),
    domoClientSecretEl = document.getElementById("domoClientSecret-el"),
    gameTypeEl = document.getElementById("gameType-el")

let creds = {
    id: "",
    secret: "",
}

/****************** Helper Functions *********************/

// Add event listener to element for specified event type that calls checkInput. checkInput enables the start button if all fields are filled in.
function addGenericListener(eventType, element) {
    element.addEventListener(eventType, () => checkInput())
}

// Format the current date and time as MM/DD/YYYY HH:MM:SS
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

/****************** Event Listeners *********************/

addGenericListener("keyup", opponentInputEl)
addGenericListener("keyup", locationEl)
addGenericListener("keyup", domoClientIdEl)
addGenericListener("keyup", domoClientSecretEl) 

// Game Type isn't generic because it's a dropdown; we need to change the color of the text when a selection is made
gameTypeEl.addEventListener("change", function() {
    gameTypeEl.style.color = "rgba(0, 0, 0, 1)"
    checkInput()
})

startButton.addEventListener("click", function() {
    let game = {
        date: formatDate(),
        opponent: "",
        location: "",
        gameType: "",
        faceOffsWon: 0,
        faceOffsLost: 0,
        totalFaceOffs: 0,
        winPercent: 0,
        gbsWon: 0,
        gbsLost: 0,
        goals: 0,
    }
    game.opponent = opponentInputEl.value
    game.location = locationEl.value
    game.gameType = gameTypeEl.value
    creds.id = domoClientIdEl.value
    creds.secret = domoClientSecretEl.value
    localStorage.setItem("game", JSON.stringify(game))
    localStorage.setItem("Domo", JSON.stringify(creds))
    window.location.href = "index.html"
})

function checkInput() {
    if (opponentInputEl.value !== '' && locationEl.value !== '' && domoClientIdEl.value !== '' && domoClientSecretEl.value !== '' && gameTypeEl.value !== '') {
        startButton.classList.remove("buttonDisabled")
        startButton.disabled = false
    } else {
        startButton.classList.add("buttonDisabled")
        startButton.disabled = true
    }
}

// Check if creds exist in local storage and populate the fields if they do.  If they don't the UI fields will be displaeyed and mandatory

function checkForDomoCreds() {
    let ls = localStorage.getItem("Domo")
    if (ls) {
        creds = JSON.parse(ls)
        domoClientIdEl.value = creds.id
        domoClientSecretEl.value = creds.secret
        domoClientIdEl.style.display = "none"
        domoClientSecretEl.style.display = "none"
        }

}

function initializeApp() {
    checkForDomoCreds()
}

// ** Initialize the app on page load
initializeApp()





        
