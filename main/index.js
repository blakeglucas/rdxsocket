import {eventChannel} from 'redux-saga'
import {call, put, take} from 'redux-saga/effects'
import {RXSocket} from './socket'

let socket

function socketEmitter(url, subscriptions, connections) {
    return eventChannel( emitter => {
        socket = new RXSocket(url, subscriptions, connections, emitter)
        return () => {
            socket.close()
        }
    })
}

export function* socketHandler(url, subscriptions, connections) {
    const channel = yield call(socketEmitter, url, subscriptions, connections)
    for (;;) {
        const action = yield take(channel)
        if (action !== undefined) {
            yield put(action)
        }
    }
}

export function* request({payload}) {
    socket.makeRequest(payload)
}