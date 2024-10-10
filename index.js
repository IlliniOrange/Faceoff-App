// Initialize variables
// Document variables
const totalWonEl = document.getElementById("totalWon-el")
const totalLostEl = document.getElementById("totalLost-el")
const winButtonEl = document.getElementById("winButton-el")
const loseButtonEl = document.getElementById("loseButton-el")
const clearButtonEl = document.getElementById("clearButton-el")
const totalFaceoffsEl = document.getElementById("totalFaceoffs-el")
const winPercentEl = document.getElementById("winPercent-el")
const opponentEl = document.getElementById("opponent-el")

// Create game object

let game = {
    date: Date(),
    opponent: "Judge",
    faceOffsWon: 0,
    faceOffsLost: 0,
    totalFaceOffs: 0,
    winPercent: 0,
}

// Load game if it exists in local storage, otherwise initialize an object

let ls = localStorage.getItem("game")
if (ls) {
    game = JSON.parse(ls)
} else {
    opponentEl.innerHTML = "<input type='text' value='Input opponent name'><button class='inputButton'>Button</button>"
}


// Testing Stuff


// Event Listeners

winButtonEl.addEventListener("click", function() {
    addTotalWon()
})

loseButtonEl.addEventListener("click", function() {
    addTotalLost()
})

clearButtonEl.addEventListener("click", function() {
    if (confirm("Are you sure? This will delete the current game")) {
        localStorage.removeItem("game")
        location.reload()
    }
})

// Save game to local storage

function saveGame() {
    localStorage.setItem("game", JSON.stringify(game))
}

// Scorekeeping functions

function addTotalWon() {
    game.faceOffsWon += 1
    game.totalFaceOffs +=1
    calcWinPercent()
    drawUI()
}

function addTotalLost() {
    game.faceOffsLost += 1
    game.totalFaceOffs += 1
    calcWinPercent()
    drawUI()
}

// Calculates the win percentage
function calcWinPercent() {
    game.winPercent = game.faceOffsWon / game.totalFaceOffs
    drawUI()
}

// Format the win percentage
function formatPercentage(num) {
    return (num * 100).toFixed(2) + '%';
  }

// Draw the UI
function drawUI() {
    totalWonEl.textContent = game.faceOffsWon
    totalLostEl.textContent = game.faceOffsLost
    totalFaceoffsEl.textContent = game.totalFaceOffs
    winPercentEl.textContent = formatPercentage(game.winPercent)
    saveGame()
}

// Start
drawUI() // Draws UI from loaded game, otherwise saves a blank game object in local storage
