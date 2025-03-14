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
        startNewGame()
    }
})

saveButtonEl.addEventListener("click", function() {
    if (confirm("Are you sure? This will save the current game")) {
        writeDataToDomo(game)
    }
})

/*************************************** Main *****************************************************/

let ls = localStorage.getItem("game") // Check if game exists in local storage, otherwise redirect to new game page
if (ls) {
    game = JSON.parse(ls)
    saveButtonEl.classList.remove("buttonDisabled")
    } else {
        window.location.href = "newgame.html"
}
let creds = JSON.parse(localStorage.getItem("Domo")) // Get creds from local storage
renderPage() // Draw the UI

/*****************************************   FUNCTIONS  ********************************************/

// Start a new game

function startNewGame() {
    localStorage.removeItem("game")
    window.location.href = "newgame.html"
}

// Increment a stat and update the HTML element
function incrementStat(stat, element) {
    stat++
    element.textContent = stat
    return stat
}

function calcWinPercent(win, total) {
    game.winPercent = win/total
    winPercentEl.textContent = formatPercentage(game.winPercent)
}

// Save game to Local Storage
function saveGame() {
    localStorage.setItem("game", JSON.stringify(game))
    saveButtonEl.classList.remove("buttonDisabled")  // Enable the save button after an event
    saveButtonEl.disabled = false
}

function formatPercentage(num) {
    return (num * 100).toFixed(2) + '%';
  }

// Draw the UI
function renderPage() {
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
    
// Function to gather and return Access Token, or throw error if unable

 async function getAccessToken() {
    const url = 'https://api.domo.com/oauth/token?grant_type=client_credentials',
          clientId = creds.id,
          clientSecret = creds.secret,
          authorizationValue = 'Basic ' + btoa( clientId + ':' + clientSecret ),
    
           options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: authorizationValue,
                grant_type: 'data',
                }
            };
    
    const response = await fetch(url, options),
          data = await response.json()

    if (response.ok) {
        return data.access_token
        } else {
            alert(`Error retrieving access token: ${data.error}`)
            throw new Error(`Unable to retrieve access token: ${data.error}, status ${response.status} at ${response.url}`)
        }
 }

 async function writeDataToDomo (game) {
    const url = 'https://api.domo.com/v1/datasets/497a5fdd-17a6-4ec7-b0d2-1298446c55a0/data?updateMethod=APPEND';
    
    let authorizationValue = ''

    // Call function for Access Token, notify and halt if unable

    try {
        authorizationValue = 'Bearer ' + await getAccessToken()
        
        } catch (error) {
            console.log(error.message)
            alert("The game was not saved becuase I'm unable to authenticate to Domo")
            return
    }
    
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
    }

    try {
        const response = await fetch(url, options)  
        if (response.ok) {
            alert("Game saved successfully!")
            startNewGame()
        } else {
            const data = await response.json()
            alert((`${data.message} Status: ${data.status}, ${data.statusReason}`))
            throw new Error (`${data.message} Status: ${data.status}, ${data.statusReason}`)
        }
    } catch (error) {
        console.error(error.message)
    }

}