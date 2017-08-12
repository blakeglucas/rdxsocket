import {eventChannel} from 'redux-saga'
import {call, put, take} from 'redux-saga/effects'
import {RXSocket} from './socket'

/** The instance pointer to the RXSocket */
let _socket

/**
 * 
 * @param {string} url The URL for the WebSocket
 * @param {string[]} subscriptions The list of event types to subscribe the socket eventListeners
 * @param {Map<string, func>} connections The mapping of event types -> actions to dispatch on message receipt
 * 
 * @return {EventChannel} The eventChannel provides the emit function to the RXSocket.
 */
function socketEmitter(url, subscriptions, connections) {
    return eventChannel( emitter => {
        _socket = new RXSocket(url, subscriptions, connections, emitter)
        return () => {
            _socket.close()
        }
    })
}

/**
 * Saga to initialize the RXSocket and begin polling for actions.
 * 
 * @param {string} url The URL for the WebSocket
 * @param {string[]} subscriptions The list of event types to subscribe the socket eventListeners
 * @param {Map<string, func>} connections The mapping of event types -> actions to dispatch on message receipt
 */
export function* socketHandler(url, subscriptions, connections) {
    const channel = yield call(socketEmitter, url, subscriptions, connections)
    for (;;) {
        const action = yield take(channel)
        if (action !== undefined) {
            yield put(action)
        }
    }
}

/**
 * Should be linked to a takeEvery in the main Redux Saga to act on every 'API Request' action dispatched.
 * @param {Action<Event>} param0 The Action payload of type Event or CustomEvent caught by the middleware.
 */
export function* request({payload}) {
    _socket.makeRequest(payload)
}