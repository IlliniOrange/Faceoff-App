const startButton = document.getElementById("startButton-el")
const opponentInputEl = document.getElementById("opponentInput-el")
const locationEl = document.getElementById("location-el")

opponentInputEl.addEventListener("keyup", function() {
    checkInput()
})

locationEl.addEventListener("keyup", function() {
    checkInput()
})

startButton.addEventListener("click", function() {
    console.log("Button Clicked")
    let game = {
        date: Date(),
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

function checkInput() {
    if (opponentInputEl.value !== '' && locationEl.value !== '') {
        startButton.classList.remove("buttonDisabled")
        startButton.disabled = false
    } else {
        startButton.classList.add("buttonDisabled")
        startButton.disabled = true
    }
}
