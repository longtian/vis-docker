import React from 'react';

import {onEvent} from './eventHandlers.es6';

class WebSocketContainer extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      status: "n/a",
      messageCount: 0
    }
  }

  onMessage(e) {
    this.setState({
      messageCount: this.state.messageCount + 1
    });
    onEvent(JSON.parse(e.data));
  }

  onOpen(e) {
    this.setState({
      status: 'open'
    });
  }

  onError(e) {
    this.setState({
      status: 'error'
    });
  }

  onClose(e) {
    this.setState({
      status: 'close'
    });
  }

  componentDidMount() {
    var socket = new WebSocket('ws://' + location.host);
    socket.addEventListener('message', this.onMessage.bind(this));
    socket.addEventListener('open', this.onOpen.bind(this));
    socket.addEventListener('error', this.onError.bind(this));
    socket.addEventListener('close', this.onClose.bind(this));
  }

  render() {
    return <span>connection:{this.state.status},message:{this.state.messageCount}</span>
  }
}

export default WebSocketContainer;