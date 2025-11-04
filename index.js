/********************************************  Constants  ************************************************************/
import { DOMO_API, writeDataToDomo, getAccessToken, getDomoCreds, checkForDomoCreds } from "./api.js";

/********************************************  Initialize Variables  *************************************************/
const elements = getElements([
    "totalWon", "totalLost", "winButton", "loseButton", "newGameButton", "totalFaceoffs", "winPercent", "opponent", "saveButton", "undoButton",
    "totalGBs", "totalGoals", "goalButton", "gbWonButton", "gbLoseButton", "gridHeader", "errorHeader", "gridContainer"
])

// Default game object structure
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

// Load undoStack from Local Storage
const undoStack = localStorage.getItem("undoStack") ? JSON.parse(localStorage.getItem("undoStack")) : []
if (!undoStack || !undoStack.length) {
    changeButtonState(elements.undoButton, "disable")
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
    elements.undoButton.addEventListener('click', undoLastAction)

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
    pushSnapshot() // snapshot state so undo can restore it
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
    pushSnapshot()
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

// Undo stack: store snapshots of previous game states (deep cloned)
function pushSnapshot() {
    undoStack.push(JSON.parse(JSON.stringify(game)))  // store a deep copy
    localStorage.setItem("undoStack", JSON.stringify(undoStack)) // Persist undo stack to Local Storage
    if (undoStack.length > 40) undoStack.shift() // cap stack size
    if (elements.undoButton) {
        changeButtonState(elements.undoButton, "enable")
    }
}

function undoLastAction() {
    if (!undoStack.length) return
    const prev = undoStack.pop()
    localStorage.setItem("undoStack", JSON.stringify(undoStack)) // Persist undo stack to Local Storage
    game = prev
    renderPage()
    saveGame()
    if (!undoStack.length && elements.undoButton) {  // Disable the button if undoStack is empty
        changeButtonState(elements.undoButton, "disable")
    }
}

function changeButtonState(element, state, text) {
    if (state === "disable") {
        element.disabled = true // Disable the save button during API call
        element.classList.add("buttonDisabled")  // Set button opacity to disabled view
    } else {
        element.disabled = false // Re-enable the save button
        element.classList.remove("buttonDisabled")  // Set button to full opacity after saving
    }
    if (text) {
        element.textContent = text
    }
}

// Display error message at the top of the
function showError(message) {
  const grid = document.getElementById('gridContainer-el');

  // Check if the error element already exists
  let errorEl = document.getElementById('errorHeader-el');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'errorHeader';
    errorEl.id = 'errorHeader-el';
    errorEl.style.gridColumn = '1 / span 2'; // Ensure it spans both columns
    grid.insertBefore(errorEl, grid.children[1]); // Insert after the gridHeader
  }

  errorEl.textContent = message;
}

// Function to hide/remove the error message
function hideError() {
  const errorEl = document.getElementById('errorHeader-el');
  if (errorEl) {
    errorEl.remove();
  }
}

// Add animation helper utilities
function triggerPulse(el) {
    if (!el) return
    el.classList.remove('pulse')
    void el.offsetWidth 
    el.classList.add('pulse')
    el.addEventListener('animationend', function handler() { // clean up after animation completes
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

// Confirms if Domo creds exist in Local Storage, if not notifiy and disable save button




// Start a new game
function startNewGame() {
    localStorage.removeItem("game") // Clear current game
    localStorage.removeItem("undoStack") // Clear undo stack on new game
    window.location.href = "newgame.html"
}

// Save game to Local Storage
function saveGame() {
    localStorage.setItem("game", JSON.stringify(game))
    changeButtonState(elements.saveButton, "enable")  // Re-enable the save button and reset text
}

// Get an access token from Domo

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
    renderPage()
    checkForDomoCreds()
}

initializeApp()