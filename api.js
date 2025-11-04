export const DOMO_API = {
    TOKEN_URL: 'https://api.domo.com/oauth/token?grant_type=client_credentials',
    DATASET_ID: '497a5fdd-17a6-4ec7-b0d2-1298446c55a0-1',
}

export async function writeDataToDomo(game) {
    const url = `https://api.domo.com/v1/datasets/${DOMO_API.DATASET_ID}/data?updateMethod=APPEND`;

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
        changeButtonState(elements.saveButton, "disable", "Saving...")  // Change button text to indicate saving and disable it
        const response = await fetch(url, options)
        if (response.ok) {
            alert("Game saved successfully!")
            changeButtonState(elements.saveButton, "enable", "Save Game")  // Re-enable the save button and reset text
            startNewGame()
        } else {
            const data = await response.json()
            alert((`${data.message} Status: ${data.status}, ${data.statusReason}`))
            throw new Error(`${data.message} Status: ${data.status}, ${data.statusReason}`)
        }
    } catch (error) {
        changeButtonState(elements.saveButton, "enable", "Save Game")  // Re-enable the save button and reset text
        console.error(error.message)
    }
}

export async function getAccessToken() {
    let creds = getDomoCreds()
    if (creds) {
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
            }
        const response = await fetch(url, options),
            data = await response.json()
        if (response.ok) {
            return data.access_token
        } else {
            // alert(`Error retrieving access token: ${data.error}`)
            throw new Error(`Unable to retrieve access token: ${data.error}, status ${response.status} at ${response.url}`)
            return data.error
        }
    } else {
        throw new Error("Domo credentials not found in local storage")
    }
}

export function getDomoCreds() {
    if (checkForDomoCreds()) {
        return JSON.parse(localStorage.getItem("Domo"))
    }
    else {
        return null
    }
}

export function checkForDomoCreds() {
    let creds = JSON.parse(localStorage.getItem("Domo"))
    if (!creds || !creds.id || !creds.secret) {
        showError("Domo credentials not found; Unable to save games")
        alert("Domo credentials not found. You will be unable to save games")
        changeButtonState(elements.saveButton, "disable")
        return false
    } else {
        hideError()
        return true
        }
}