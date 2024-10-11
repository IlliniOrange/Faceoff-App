const startButton = document.getElementById("startButton-el")
const opponentInputEl = document.getElementById("opponentInput-el")
const locationEl = document.getElementById("location-el")

opponentInputEl.addEventListener("click", function() {
    opponentInputEl.value = ""
})

locationEl.addEventListener("click", function() {
    locationEl.value = ""
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
    }
    game.opponent = opponentInputEl.value
    localStorage.setItem("game", JSON.stringify(game))
    window.location.href = "index.html"
})


