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

let game = {
    date: Date(),
    location: "",
    opponent: "",
    faceOffsWon: 0,
    faceOffsLost: 0,
    totalFaceOffs: 0,
    winPercent: 0,
    gbsWon : 0,
    gbsLost: 0,
}

/**********  Load game from Local Storage, otherwise redirect to new game page  **********/

let ls = localStorage.getItem("game")
if (ls) {
    game = JSON.parse(ls)
    saveButtonEl.classList.remove("buttonDisabled")
    } else {
        window.location.href = "newgame.html"
}

/**********  Render page variables  *********/

drawUI()

/**********  Event Listeners  **********/

winButtonEl.addEventListener("click", function() {
    game.faceOffsWon = incrementStat(game.faceOffsWon, totalWonEl)
    game.totalFaceOffs = incrementStat(game.totalFaceOffs, totalFaceoffsEl)
    calcWinPercent(game.faceOffsWon, game.totalFaceOffs)
    saveGame()
})

loseButtonEl.addEventListener("click", function() {
    game.faceOffsLost = incrementStat(game.faceOffsLost, totalLostEl)
    game.totalFaceOffs = incrementStat(game.totalFaceOffs, totalFaceoffsEl)
    calcWinPercent(game.faceOffsWon, game.totalFaceOffs)
    saveGame()
})

gbWonButtonEl.addEventListener("click", function() {
    game.gbsWon = incrementStat(game.gbsWon, totalGBsEl)
    saveGame()
})

gbLoseButtonEl.addEventListener("click", function() {
    game.gbsLost = incrementStat(game.gbsLost, gbsLostEl)
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

/**********  Increment a stat and update the HTML element  **********/

function incrementStat(stat, element) {
    stat++
    element.textContent = stat
    return stat
}

function calcWinPercent(win, total) {
    game.winPercent = win/total
    winPercentEl.textContent = formatPercentage(game.winPercent)
}
/**********  Save game to Local Storage  **********/

function saveGame() {
    localStorage.setItem("game", JSON.stringify(game))
    saveButtonEl.classList.remove("buttonDisabled")  // Enable the save button after an event
    saveButtonEl.disabled = false
}

// Scorekeeping functions

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
    
    let gameArray = []
    for (const [key, value] of Object.entries(game)) {
        gameArray.push(value)
    }
    const gameString = gameArray.join(","),
        options = {
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