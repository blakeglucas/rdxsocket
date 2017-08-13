/**
 * The WebSocket wrapper class.
 * 
 * @author Lucas, Blake.
 */
export class RXSocket {

    /**
     * 
     * @param {string} url The URL passed from the intialization saga.
     * @param {string[]} subscriptions The event types to which to subscribe the WebSocket eventListeners
     * @param {Map<string, func>} connections The mapping between event type and action function to dispatch upon message receipt
     * @param {ActionEmitter} emitter The emitter from the eventChannel to broadcast the action inside the handler.
     */
    constructor(url, subscriptions, connections, emitter) {
        console.log(url, subscriptions, connections)
        this.url = url
        this.subscriptions = subscriptions
        this.connections = connections
        this.emit = emitter
        this.socket = new WebSocket(url)
        this.socket.onopen = this.onOpen
        this.socket.onclose = this.onClose
        this.socket.onmessage = this.onMessage
        this.socket.onerror = this.onError
    }

    /**
     * Subscribes the socket to all of the eventListeners to the types in the subscriptions parameter. Handles Events and CustomEvents.
     */
    onOpen = () => {
        console.log('Redux-Socket open')
        this.subscriptions.map(type => {
            this.socket.addEventListener(type, ({detail}) => {
                let message = {
                    type,
                }
                if (detail !== undefined) {
                    message = {
                        ...message,
                        payload: detail,
                    }
                }
                this.send(message)
            })
        })
        
    }

    /**
     * Unsubscribes the socket from all events in the subscription parameter.
     */
    onClose = () => {
        console.log('Redux-Socket closed')
        this.subscriptions.map(type => {
            this.socket.removeEventListener(type)
        })
    }

    /**
     * Sends the string of the payload through the WebSocket connection.
     * 
     * TODO: Needs wrapping in socket state checking and a setTimeout?
     */
    send = (payload) => {
        console.log(payload)
        this.socket.send(JSON.stringify(payload))
    }

    /**
     * Handles incoming messages and connects the types of incoming messages to actions that need to be dispatched.
     */
    onMessage = ({data}) => {
        const {type, payload} = JSON.parse(data)
        const action = this.connections[type]
        if (action !== undefined) {
            this.emit(action(payload))
        }
    }

    /**
     * Exposes the dispatchEvent method of the WebSocket to the request saga of the Wrapper.
     */
    makeRequest = (event) => {
        this.socket.dispatchEvent(event)
    }

    /**
     * Exposes the WebSocket close method of the WebSocket to the eventChannel.
     */
    close = () => {
        this.socket.close()
    }

    /**
     * Handles socket errors.
     */
    onError = (e) => {
        throw e
    }
}