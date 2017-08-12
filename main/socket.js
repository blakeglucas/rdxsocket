export class RXSocket {

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

    onClose = () => {
        console.log('Redux-Socket closed')
        this.subscriptions.map(type => {
            this.socket.removeEventListener(type)
        })
    }

    send = (payload) => {
        console.log(payload)
        this.socket.send(JSON.stringify(payload))
    }

    onMessage = ({data}) => {
        const {type, payload} = JSON.parse(data)
        const action = this.connections[type]
        if (action !== undefined) {
            this.emit(action(payload))
        }
    }

    makeRequest = (event) => {
        this.socket.dispatchEvent(event)
    }

    close = () => {
        this.socket.close()
    }

    onError = (e) => {
        throw new Error(e)
    }
}