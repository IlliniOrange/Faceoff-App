/********************************************  Constants  ************************************************************/

const DOMO_API = {
    TOKEN_URL: 'https://api.domo.com/oauth/token?grant_type=client_credentials',
    DATASET_ID: '497a5fdd-17a6-4ec7-b0d2-1298446c55a0',
}

/********************************************  Initialize Variables  *************************************************/
const elements = getElements([
    "totalWon", "totalLost", "winButton", "loseButton", "newGameButton", "totalFaceoffs", "winPercent", "opponent", "saveButton",
    "totalGBs", "totalGoals", "goalButton", "gbWonButton", "gbLoseButton", "gridHeader"
])

// Default game structure
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

// Load game from Local Storage, if it doesn't exist redirect to new game page
let game
try {
    const ls = localStorage.getItem("game")
    game = ls ? JSON.parse(ls) : { ...defaultGame }
    if (!ls) window.location.href = "newgame.html";
} catch (error) {
    console.error("Error loading game from local storage:", error);
    game = { ...defaultGame };
}

// Load Domo credentials from Local Storage
let creds = JSON.parse(localStorage.getItem("Domo")) // Get client ID and secret from local storage

// Load undo stack from Local Storage
const undoStack = localStorage.getItem("undoStack") ? JSON.parse(localStorage.getItem("undoStack")) : []
if (!undoStack) {
    undoButton.disabled = true
    undoButton.classList.add("buttonDisabled")
}

/********************************************  Event Listeners  *************************************************/

function setupEventListeners() {
    elements.winButton.addEventListener("click", () => handleFaceoff("win"));
    elements.loseButton.addEventListener("click", () => handleFaceoff("lose"));
    elements.gbWonButton.addEventListener("click", () => handleStatUpdate("gbsWon", elements.totalGBs));
    elements.goalButton.addEventListener("click", () => handleStatUpdate("goals", elements.totalGoals));

    // New Game and Save buttons with confirmation prompts
    elements.newGameButton.addEventListener("click", function () {
        if (confirm("Are you sure? This will delete the current game")) {
            startNewGame()
        }
    })

    elements.saveButton.addEventListener("click", function () {
        if (confirm("Are you sure? This will save the current game")) {
            writeDataToDomo(game)
        }
    })

    
    // Undo button (disabled by default)
    if (elements.undoButton) {
        // elements.undoButton.disabled = true
        // elements.undoButton.classList.add("buttonDisabled")
        elements.undoButton.addEventListener('click', undoLastAction)
    }
}

/********************************************* Halper Functions ***********************************************/

// Get element IDs for a list of elements
function getElements(ids) {
    const result = {}
    ids.forEach(id => {
        result[id] = document.getElementById(`${id}-el`)
    })
    return result
}

// Handle a faceoff win or loss, incrementing the appropriate stats and updating the UI
function handleFaceoff(type) {
    if (type === "win") {
        game.faceOffsWon = incrementStat(game.faceOffsWon, elements.totalWon);
    } else if (type === "lose") {
        game.faceOffsLost = incrementStat(game.faceOffsLost, elements.totalLost);
    }
    game.totalFaceOffs = incrementStat(game.totalFaceOffs, elements.totalFaceoffs);
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
    game.winPercent = win / total
    elements.winPercent.textContent = formatPercentage(game.winPercent)
    // flash the win percent to draw attention when it changes
    triggerFlash(elements.winPercent)
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

// Undo stack: store snapshots of previous game states (deep cloned)

function pushSnapshot() {
    undoStack.push(JSON.parse(JSON.stringify(game)))  // store a deep copy
    localStorage.setItem("undoStack", JSON.stringify(undoStack)) // Persist undo stack to Local Storage
    if (undoStack.length > 40) undoStack.shift() // cap stack size
    if (elements.undoButton) {
        elements.undoButton.disabled = false
        elements.undoButton.classList.remove("buttonDisabled")
    }
}

function undoLastAction() {
    if (!undoStack.length) return
    const prev = undoStack.pop()
    localStorage.setItem("undoStack", JSON.stringify(undoStack)) // Persist undo stack to Local Storage
    game = prev
    renderPage()
    saveGame()
    if (!undoStack.length && elements.undoButton) {
        elements.undoButton.disabled = true
        elements.undoButton.classList.add("buttonDisabled")
    }
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
    localStorage.removeItem("game") // Clear current game
    localStorage.removeItem("undoStack") // Clear undo stack on new game
    window.location.href = "newgame.html"
}

// Save game to Local Storage
function saveGame() {
    localStorage.setItem("game", JSON.stringify(game))
    elements.saveButton.classList.remove("buttonDisabled")  // Enable the save button after an event
    elements.saveButton.disabled = false
}

/* This section contains the functions used to write the data to Domo through OAuth API
    - For now, not expecting to save data in less than 1 hour intervals, the code will refresh
    the token on each call */

async function writeDataToDomo(game) {
    const url = `https://api.domo.com/v1/datasets/${DOMO_API.DATASET_ID}/data?updateMethod=APPEND`;

    /**************** Helper functions (writeDataToDomo scope) ******************/

    // Get an access token from Domo
    async function getAccessToken() {
        const url = DOMO_API.TOKEN_URL,
            clientId = creds.id,
            clientSecret = creds.secret,
            authorizationValue = 'Basic ' + btoa(clientId + ':' + clientSecret),

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

    // Toggle the save button between enabled and disabled states with appropriate text during API call 
    function toggleSaveButton(state, text) {
        if (state === "disable") {
            elements.saveButton.disabled = true // Disable the save button during API call
            elements.saveButton.classList.add("buttonDisabled")  // Set button opacity to disabled view
        } else {
            elements.saveButton.disabled = false // Re-enable the save button
            elements.saveButton.classList.remove("buttonDisabled")  // Set button to full opacity after saving
        }
        elements.saveButton.textContent = text
    }

    /**************** Obtain Token and write data *******************************/

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
        toggleSaveButton("disable", "Saving...")  // Change button text to indicate saving and disable it
        const response = await fetch(url, options)
        if (response.ok) {
            alert("Game saved successfully!")
            toggleSaveButton("enable", "Save Game")  // Re-enable the save button and reset text
            startNewGame()
        } else {
            const data = await response.json()
            alert((`${data.message} Status: ${data.status}, ${data.statusReason}`))
            throw new Error(`${data.message} Status: ${data.status}, ${data.statusReason}`)
        }
    } catch (error) {
        toggleSaveButton("enable", "Save Game")  // Re-enable the save button and reset text
        console.error(error.message)
    }
}

// Initialize the UI
function renderPage() {
    elements.gridHeader.textContent = "Vs: " + game.opponent
    elements.totalWon.textContent = game.faceOffsWon
    elements.totalLost.textContent = game.faceOffsLost
    elements.totalFaceoffs.textContent = game.totalFaceOffs
    elements.winPercent.textContent = formatPercentage(game.winPercent)
    elements.totalGBs.textContent = game.gbsWon
    elements.totalGoals.textContent = game.goals
}

function initializeApp() {
    setupEventListeners()
    renderPage() // Draw the UI
}

initializeApp() // Draw the UI