/********************************************  Initialize Variables  *************************************************/

function getEl(id) {
    return document.getElementById(id);
}

const totalWonEl = getEl("totalWon-el"),
    totalLostEl = getEl("totalLost-el"),
    winButtonEl = getEl("winButton-el"),
    loseButtonEl = getEl("loseButton-el"),
    newGameButtonEl = getEl("newGameButton-el"),
    totalFaceoffsEl = getEl("totalFaceoffs-el"),
    winPercentEl = getEl("winPercent-el"),
    opponentEl = getEl("opponent-el"),
    saveButtonEl = getEl("saveButton-el"),
    totalGBsEl = getEl("totalGBs-el"),
    totalGoalsEl = getEl("totalGoals-el"),
    goalButtonEl = getEl("goalButton-el"),
    gbWonButtonEl = getEl("gbWonButton-el"),
    gbLoseButtonEl = getEl("gbLoseButton-el"),
    gridHeaderEl = getEl("gridHeader-el")

const defaultGame = {
    date: new Date().toISOString(),
    location: "",
    opponent: "",
    faceOffsWon: 0,
    faceOffsLost: 0,
    totalFaceOffs: 0,
    winPercent: 0,
    gbsWon: 0,
    gbsLost: 0,
    goals: 0,
};

let game = { ...defaultGame }

// Load game from Local Storage, if it doesn't exist redirect to new game page
let ls = localStorage.getItem("game")
    if (ls) {
        game = JSON.parse(ls)
        saveButtonEl.classList.remove("buttonDisabled")      
        } else {
            window.location.href = "newgame.html"
    }

let creds = JSON.parse(localStorage.getItem("Domo")) // Get client ID and secret from local storage


/********************************************  Event Listeners  *************************************************/

function setupEventListeners() {
    winButtonEl.addEventListener("click", () => handleFaceoff("win"));
    loseButtonEl.addEventListener("click", () => handleFaceoff("lose"));
    gbWonButtonEl.addEventListener("click", () => handleStatUpdate("gbsWon", totalGBsEl));
    goalButtonEl.addEventListener("click", () => handleStatUpdate("goals", totalGoalsEl));

    // New Game and Save buttons with confirmation prompts
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
}

/********************************************* Halper Functions ***********************************************/

// Handle a faceoff win or loss, incrementing the appropriate stats and updating the UI
function handleFaceoff(type) {
    if (type === "win") {
        game.faceOffsWon = incrementStat(game.faceOffsWon, totalWonEl);
    } else if (type === "lose") {
        game.faceOffsLost = incrementStat(game.faceOffsLost, totalLostEl);
    }

    game.totalFaceOffs = incrementStat(game.totalFaceOffs, totalFaceoffsEl);
    calcWinPercent(game.faceOffsWon, game.totalFaceOffs);
    saveGame();
}

//  Handle updating a generic stat, incrementing the stat and updating the UI
function handleStatUpdate(statKey, element) {
    game[statKey] = incrementStat(game[statKey], element);
    saveGame();
}

// Increment a stat, update the HTML element, and trigger CSS animation
function incrementStat(stat, element) {
    stat++
    element.textContent = stat
    // trigger a brief pulse animation when a stat changes
    triggerPulse(element)
    return stat
}

// Calculate and update win percentage
function calcWinPercent(win, total) {
    game.winPercent = win/total
    winPercentEl.textContent = formatPercentage(game.winPercent)
    // flash the win percent to draw attention when it changes
    triggerFlash(winPercentEl)
}

function formatPercentage(num) {
    return (num * 100).toFixed(2) + '%';
  }

// Add animation helper utilities
function triggerPulse(el) {
    if (!el) return
    el.classList.remove('pulse')
    // force reflow to restart animation
    void el.offsetWidth
    el.classList.add('pulse')
    // clean up after animation completes
    el.addEventListener('animationend', function handler() {
        el.classList.remove('pulse')
        el.removeEventListener('animationend', handler)
    })
}

// Flash animation to draw attention to an element that updates
function triggerFlash(el) {
    if (!el) return
    el.classList.remove('flash')
    void el.offsetWidth
    el.classList.add('flash')
    el.addEventListener('animationend', function handler() {
        el.classList.remove('flash')
        el.removeEventListener('animationend', handler)
    })
}


/*****************************************  FUNCTIONS  ********************************************/

// Start a new game

function startNewGame() {
    localStorage.removeItem("game")
    window.location.href = "newgame.html"
}


// Save game to Local Storage
function saveGame() {
    localStorage.setItem("game", JSON.stringify(game))
    saveButtonEl.classList.remove("buttonDisabled")  // Enable the save button after an event
    saveButtonEl.disabled = false
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

// Initialize the UI
function renderPage() {
    gridHeaderEl.textContent = "Vs: " + game.opponent
    totalWonEl.textContent = game.faceOffsWon
    totalLostEl.textContent = game.faceOffsLost
    totalFaceoffsEl.textContent = game.totalFaceOffs
    winPercentEl.textContent = formatPercentage(game.winPercent)
    totalGBsEl.textContent = game.gbsWon
    totalGoalsEl.textContent = game.goals
}

function initializeApp() { 
    setupEventListeners()
    renderPage() // Draw the UI
}

initializeApp() // Draw the UI