import { DOMO_API_CONFIG } from './config.js'

/**
 * Retrieves Domo credentials from localStorage and validates them.
 * @returns {Object|null} - The credentials object if valid, otherwise null.
 */
export async function getDomoCreds() {
    try {
        const creds = JSON.parse(localStorage.getItem("Domo"))
        return creds && creds.id && creds.secret ? creds : null
    } catch (error) {
        throw Error('Unable to retrieve Domo credentials from storage', error)
    }
}

/**
 * Retrieves the authorization header for Domo API requests.
 * @returns {Promise<string>} - A bearer token string for use in headers.
 */
async function getAuthorizationHeader() {
        const token = await getAccessToken()
        return `Bearer ${token}`
}
import { DOMO_API_CONFIG } from './config.js'

/**
 * Retrieves Domo credentials from localStorage and validates them.
 * @returns {Object|null} - The credentials object if valid, otherwise null.
 */
export async function getDomoCreds() {
    try {
        const creds = JSON.parse(localStorage.getItem("Domo"))
        return creds && creds.id && creds.secret ? creds : null
    } catch (error) {
        throw Error(`Unable to retrieve Domo credentials from storage: ${error}`)
    }
}

/**
 * Retrieves the authorization header for Domo API requests.
 * @returns {Promise<string>} - A bearer token string for use in headers.
 */
async function getAuthorizationHeader() {
        const token = await getAccessToken()
        return `Bearer ${token}`
}

/**
 * Makes an HTTP request to the Domo API using the specified method, endpoint, headers, and optional body.
 *
 * @param {string} method - The HTTP method to use (e.g., 'GET', 'POST', 'PUT').
 * @param {string} endpoint - The API endpoint to call, relative to the base URL.
 * @param {Object} headers - An object containing HTTP headers for the request.
 * @param {string|Object} [body=""] - Optional request body to include, typically for POST or PUT requests.
 * @returns {Promise<Response>} - A promise that resolves to the fetch Response object.
 * @throws {Error} - Throws an error if the fetch request fails.
 */
export async function callDomoAPI(method, endpoint, headers, body = "") {
    const url = DOMO_API_CONFIG.BASE_URL + endpoint,
        options = {
        method: method,
        headers: headers,
    }

    if (body) {
        options.body = body
    }

    try {
        return await fetch(url, options)
        } catch (error) {
            console.error(`Error calling Domom API at ${url}:`, error)
            throw Error(`Domo API Call failed: ${error.message}`)
    }
}


/**
 * Retrieves an OAuth access token from the Domo API using client credentials stored in localStorage.
 *
 * @returns {Promise<string>} - A promise that resolves to the access token string.
 * @throws {Error} - Throws an error if credentials are missing or invalid, 
 *                   or if the API response does not contain an access token.
 */
export async function getAccessToken() {
    const endpoint = '/oauth/token?grant_type=client_credentials',
        creds = await getDomoCreds()

        if (!creds || !creds.id || !creds.secret) {
            throw Error("Domo credentials not retrieved")
        }

        const headers = {
                    Accept: 'application/json',
                    Authorization: 'Basic ' + btoa(creds.id + ':' + creds.secret),
                    scope: "data"
                },

    response = await callDomoAPI("GET", endpoint, headers)
    const data = await response.json();

        if (!data.access_token) {
            throw new Error('Access token not found in response');
        }
    return data.access_token
}

/**
 * Sends game data to the Domo API by appending it to a specified dataset.
 *
 * @param {Object} game - An object representing the game data to be sent. 
 *                        The values of the object are converted to a CSV string.
 * @returns {Promise<Response>} - A promise that resolves to the fetch Response object from the Domo API.
 * @throws {Error} - Throws an error if authorization fails or the API call encounters an issue.
 */

export async function writeDataToDomo(game) {
    const endpoint = `/v1/datasets/${DOMO_API_CONFIG.DATASET_ID}/data?updateMethod=APPEND`,
        headers = {
                    'Content-Type': 'text/csv',
                    Accept: 'application/json',
                    Authorization: await getAuthorizationHeader(),
                },
        body = Object.values(game).join(",")
    return await callDomoAPI("PUT", endpoint, headers, body)
}
/**
 * Makes an HTTP request to the Domo API using the specified method, endpoint, headers, and optional body.
 *
 * @param {string} method - The HTTP method to use (e.g., 'GET', 'POST', 'PUT').
 * @param {string} endpoint - The API endpoint to call, relative to the base URL.
 * @param {Object} headers - An object containing HTTP headers for the request.
 * @param {string|Object} [body=""] - Optional request body to include, typically for POST or PUT requests.
 * @returns {Promise<Response>} - A promise that resolves to the fetch Response object.
 * @throws {Error} - Throws an error if the fetch request fails.
 */
export async function callDomoAPI(method, endpoint, headers, body = "") {
    const url = DOMO_API_CONFIG.BASE_URL + endpoint,
        options = {
        method: method,
        headers: headers,
    }

    if (body) {
        options.body = body
    }

    try {
        return await fetch(url, options)
        } catch (error) {
            console.error(`Error calling Domom API at ${url}:`, error)
            throw Error(`Domo API Call failed: ${error.message}`)
    }
}

/**
 * Retrieves an OAuth access token from the Domo API using client credentials stored in localStorage.
 *
 * @returns {Promise<string>} - A promise that resolves to the access token string.
 * @throws {Error} - Throws an error if credentials are missing or invalid, 
 *                   or if the API response does not contain an access token.
 */
export async function getAccessToken() {
    const endpoint = '/oauth/token?grant_type=client_credentials',
        creds = await getDomoCreds()

        if (!creds || !creds.id || !creds.secret) {
            throw Error("Domo credentials not retrieved")
        }

        const headers = {
                    Accept: 'application/json',
                    Authorization: 'Basic ' + btoa(creds.id + ':' + creds.secret),
                    scope: "data"
                },

    response = await callDomoAPI("GET", endpoint, headers)
    const data = await response.json();

        if (!data.access_token) {
            throw new Error('Access token not found in response');
        }
    return data.access_token
}

/**
 * Sends game data to the Domo API by appending it to a specified dataset.
 *
 * @param {Object} game - An object representing the game data to be sent. 
 *                        The values of the object are converted to a CSV string.
 * @returns {Promise<Response>} - A promise that resolves to the fetch Response object from the Domo API.
 * @throws {Error} - Throws an error if authorization fails or the API call encounters an issue.
 */

export async function writeDataToDomo(game) {
    const endpoint = `/v1/datasets/${DOMO_API_CONFIG.DATASET_ID}/data?updateMethod=APPEND`,
        headers = {
                    'Content-Type': 'text/csv',
                    Accept: 'application/json',
                    Authorization: await getAuthorizationHeader(),
                },
        body = Object.values(game).join(",")
    return await callDomoAPI("PUT", endpoint, headers, body)
}