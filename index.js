// Initialize variables

const totalWonEl = document.getElementById("totalWon-el")
const winButtonEl = docuent.getElementById("winButton-el")


// Scorekeeping functions

function addTotalWon() {
    totalWon += 1
    totalWonEl.textContent = totalWon
}

// Listeners

winButtonEl.addEventListener("click", function() {
    addTotalWon()
})