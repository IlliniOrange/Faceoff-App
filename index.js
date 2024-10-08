// Initialize variables
// Document variables
const totalWonEl = document.getElementById("totalWon-el")
const totalLostEl = document.getElementById("totalLost-el")
const winButtonEl = document.getElementById("winButton-el")
const loseButtonEl = document.getElementById("loseButton-el")
const totalFaceoffsEl = document.getElementById("totalFaceoffs-el")
const winPercentEl = document.getElementById("winPercent-el")

// Scorekeeping variables
let totalWon = 0
let totalLost = 0
let totalFaceoffs = 0
let winPercent = 0

// Testing Stuff
    console.log(Date())

// Event Listeners

winButtonEl.addEventListener("click", function() {
    addTotalWon()
})

loseButtonEl.addEventListener("click", function() {
    addTotalLost()
})

// Scorekeeping functions

function addTotalWon() {
    totalWon += 1
    totalWonEl.textContent = totalWon
    totalFaceoffs += 1
    calcWinPercent()
}

function addTotalLost() {
    totalLost += 1
    totalLostEl.textContent = totalLost
    totalFaceoffs += 1
    calcWinPercent()
}

// Calculates the win percentage
function calcWinPercent() {
    winPercent = totalWon / totalFaceoffs
    winPercentEl.textContent = formatPercentage(winPercent)
    totalFaceoffsEl.textContent = totalFaceoffs
}

// Format the win percentage
function formatPercentage(num) {
  return (num * 100).toFixed(2) + '%';
}