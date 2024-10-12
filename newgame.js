const startButton = document.getElementById("startButton-el"),
    opponentInputEl = document.getElementById("opponentInput-el"),
    locationEl = document.getElementById("location-el")

opponentInputEl.addEventListener("keyup", function() {
    checkInput()
})

locationEl.addEventListener("keyup", function() {
    checkInput()
})

startButton.addEventListener("click", function() {
    console.log("Button Clicked")
    let game = {
        date: formatDate(),
        opponent: "",
        faceOffsWon: 0,
        faceOffsLost: 0,
        totalFaceOffs: 0,
        winPercent: 0,
        gbsWon: 0,
        gbsLost: 0,
    }
    game.opponent = opponentInputEl.value
    localStorage.setItem("game", JSON.stringify(game))
    window.location.href = "index.html"
})

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
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
    if (opponentInputEl.value !== '' && locationEl.value !== '') {
        startButton.classList.remove("buttonDisabled")
        startButton.disabled = false
    } else {
        startButton.classList.add("buttonDisabled")
        startButton.disabled = true
    }
}
