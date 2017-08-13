# RDX Socket (Redux Socket)
Extremely simple websocket binding designed for direct integration in redux-saga.

## Installation
RDX Socket is hosted on the npm registry. To install, run `npm i --save rdxsocket` or `yarn add rdxsocket`.

## Usage
RDX Socket wraps the basic WebSocket with an event-driven process flow. No extra middleware is required, it integrates directly into a redux saga.

In a `saga.js` file:
```
import {socketHandler, request} from 'rdxsocket'
import * as actions from './actions'
import * as events from './events'

const subscriptions = [
  events.fetchData.type,
]

const connections = {
  events.fetchData.type: actions.setData
}

export function* saga() {
  yield all([
    fork(socketHandler, 'ws://localhost:8082/main', subscriptions, connections),
    takeEvery(`${actions.request}`, request),
    // ... any other sagas
  ])
}
```

In some `index.js`:
```
...

const mapDispatchToProps = (dispatch) => ({
  fetchData: () => dispatch(actions.request(events.fetchData))  // Payload should be an Event or CustomEvent
  ...
})

...
```

In the corresponding `template.js`:
```
...

  componentDidMount() {
    this.props.fetchData()
  }
...
```
In this example, `actions.request` is the action type dispatched by any components requesting data from the websocket. `subscriptions` are the types of events the socket should subscribe to. The when `actions.request` are dispatched, the `request` saga in RDX Socket dispatches those events to the socket, which in turn makes the calls to the backend. `connections` are the actions ('value') the RDX wrapper should `emit` whenever it receives a message of type 'key'. In the above example, if RDX Socket receives a message of type 'FETCH_DATA' (or whatever `events.fetchData.type` equals), it will emit an action `actions.setData` with the payload it received from the WebSocket.

*Note: to minimize variable creation the `subscriptions` variable could be replaced in the `fork` call with `Object.keys(connections)` if the socket only needed to subscribe to events that required an action be dispatched.*

Every event in the `events` file should be of type `Event` or `CustomEvent`. RDX Socket can handle `CustomEvent`s with the payload located in the `detail` prop.

### Variable Name Summary
When learning Redux, it helped me to explain to myself what certainly variables were representing in English (especially with mapStateToProps and mapDispatchToProps). 
- `subscriptions`: The `requests` I want the socket to **subscribe** to, a.k.a. listen for internally.
- `connections`: The **connections** I want the socket to make between incoming message and action to emit ("When I receive a message of type `key`, I should emit an action `value`").

## Socket Message Schema
RDX Socket is best suited for developers who have control over their front and back ends. It was designed initially with the intent to use with Groovy and Spring (Boot), but is compatible with any vanilla WebSocket implementation (see Technical Debt).

The default schema RDX Socket expects in messages to receive is 
```
{
  type: type,     // The type of message to check for connections
  payload: data,  // The data to emit in the action payload (can be undefined)
}
```
My `WebSocketHandler` is configured to just echo the type when replying to messages, which is why it is possible to use `Object.keys(connections)` instead of separate `subscriptions` and `connections` when calling the socketHandler `fork`.

## Technical Debt
- Unknown functionality with SockJS or other WebSocket wrappers.
- Using multiple RDX Socket instances is untested.
- Unit tests. 
