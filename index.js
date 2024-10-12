// Initialize variables

const totalWonEl = document.getElementById("totalWon-el"),
    totalLostEl = document.getElementById("totalLost-el"),
    winButtonEl = document.getElementById("winButton-el"),
    loseButtonEl = document.getElementById("loseButton-el"),
    newGameButtonEl = document.getElementById("newGameButton-el"),
    totalFaceoffsEl = document.getElementById("totalFaceoffs-el"),
    winPercentEl = document.getElementById("winPercent-el"),
    opponentEl = document.getElementById("opponent-el"),
    saveButtonEl = document.getElementById("saveButton-el"),
    totalGBsEl = document.getElementById("totalGBs-el"),
    gbsLostEl = document.getElementById("gbsLost-el"),
    gbWonButtonEl = document.getElementById("gbWonButton-el"),
    gbLoseButtonEl = document.getElementById("gbLoseButton-el"),
    gridHeaderEl = document.getElementById("gridHeader-el")

// Initialize game object

let game = {
    date: Date(),
    opponent: "",
    faceOffsWon: 0,
    faceOffsLost: 0,
    totalFaceOffs: 0,
    winPercent: 0,
    gbsWon : 0,
    gbsLost: 0,
}

// If a game exists in local storage, load it to the game object. Otherwise redirect to newgame.html

let ls = localStorage.getItem("game")
if (ls) {
    game = JSON.parse(ls)
} else {
    window.location.href = "newgame.html"
}

// Event Listeners

winButtonEl.addEventListener("click", function() {
    addTotalWon()
    saveGame()
})

loseButtonEl.addEventListener("click", function() {
    addTotalLost()
    saveGame()
})

gbWonButtonEl.addEventListener("click", function() {
    addGBWon()
    saveGame()
})

gbLoseButtonEl.addEventListener("click", function() {
    addGBLost()
    saveGame()
})

newGameButtonEl.addEventListener("click", function() {
    if (confirm("Are you sure? This will delete the current game")) {
        localStorage.removeItem("game")
        window.location.href = "newgame.html"
    }
})

saveButtonEl.addEventListener("click", function() {
    if (confirm("Are you sure? This will save the current game")) {
        writeDataToDomo(game)
    }
})

// Save game to local storage

function saveGame() {
    localStorage.setItem("game", JSON.stringify(game))
    saveButtonEl.classList.remove("buttonDisabled")  // saveGame is only called afer a new score event, either a new game or after loading a game. This is used to enable the save button
    saveButtonEl.disabled = false
}

// Scorekeeping functions

function addTotalWon() {
    game.faceOffsWon++
    game.totalFaceOffs++
    calcWinPercent()
    drawUI()
}

function addTotalLost() {
    game.faceOffsLost++
    game.totalFaceOffs++
    calcWinPercent()
    drawUI()
}

function calcWinPercent() {
    game.winPercent = game.faceOffsWon / game.totalFaceOffs
    drawUI()
}

function addGBWon() {
    game.gbsWon++
    drawUI()
}

function addGBLost() {
    game.gbsLost++
    drawUI()
}

function formatPercentage(num) {
    return (num * 100).toFixed(2) + '%';
  }

// Draw the UI
function drawUI() {
    gridHeaderEl.textContent = "Vs: " + game.opponent
    totalWonEl.textContent = game.faceOffsWon
    totalLostEl.textContent = game.faceOffsLost
    totalFaceoffsEl.textContent = game.totalFaceOffs
    winPercentEl.textContent = formatPercentage(game.winPercent)
    totalGBsEl.textContent = game.gbsWon
    gbsLostEl.textContent = game.gbsLost
}

/* This section contains the functions used to write the data to Domo through OAuth API
    - For now, not expecting to save data in less than 1 hour intervals, the code will refresh
    the token on each call */
    
// Get an access token
 async function getAccessToken() {
    const url = 'https://api.domo.com/oauth/token?grant_type=client_credentials';
    const clientId = '6b23c9b5-fb97-464a-8c51-2ec477cfac47'
    const clientSecret = '1790fd9c39c979cf4d400576ccf162b7437b6139bd754c5a37037f9e6b5f46e6'
    const authorizationValue = 'Basic ' + btoa( clientId + ':' + clientSecret )
    
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: authorizationValue,
        grant_type: 'data',
      }
    };
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();  
        return await data.access_token
    } catch (error) {
        console.error(error);
    }
 }

 async function writeDataToDomo (game) {
    const url = 'https://api.domo.com/v1/datasets/497a5fdd-17a6-4ec7-b0d2-1298446c55a0/data?updateMethod=APPEND';
    const authorizationValue = 'Bearer ' + await getAccessToken()
    const gameString = game.date + "," + game.opponent + "," + game.faceOffsWon + "," + game.faceOffsLost + "," + game.totalFaceOffs + "," + game.winPercent + "," + game.gbsWon + "," + game.gbsLost
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/csv',
            Accept: 'application/json',
            Authorization: authorizationValue,
        },
        body: gameString
    };

    try {
        const response = await fetch(url, options)
        const data = await response.json()
    } catch (error) {
        // console.error(error)
    }

    }

// Start
drawUI()