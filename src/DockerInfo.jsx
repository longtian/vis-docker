import React from 'react';
import $ from 'jquery';
import {onEvent} from './eventHandlers.es6';

class DockerInfo extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      status: "n/a",
      messageCount: 0,
      ApiVersion: "n/a",
      reconnectCount: 0,
      Version: "n/a"
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
      status: 'open',
      reconnectCount: 0
    });
  }

  onError(e) {
    this.setState({
      status: 'error'
    });
  }

  onClose(e) {
    let reconnectCount = this.state.reconnectCount + 1;

    this.setState({
      status: `reconnect ...${reconnectCount}`,
      reconnectCount
    });

    setTimeout(()=> {
      this.connect()
    }, 3000);
  }

  componentDidMount() {
    this.fetchVersion();
    this.connect();
  }

  connect() {
    let {
      host,
      protocol
    } = window.location;
    var socket = new WebSocket(`${protocol == "http:" ? "ws://" : "wss://"}${location.host}`);
    socket.addEventListener('message', this.onMessage.bind(this));
    socket.addEventListener('open', this.onOpen.bind(this));
    socket.addEventListener('error', this.onError.bind(this));
    socket.addEventListener('close', this.onClose.bind(this));
  }

  fetchVersion() {
    $.getJSON('/version', res=> {
      let {
        ApiVersion,
        Version
      } = res;

      this.setState({
        ApiVersion,
        Version
      })
    })
  }

  render() {
    return <table className="pure-table pure-table-bordered pure-table-striped" style={{width:"100%"}}>
      <tbody>

      <tr>
        <td colSpan="2"><strong>Docker</strong></td>
      </tr>
      <tr>
        <td>Version</td>
        <td>{this.state.Version}</td>
      </tr>
      <tr>
        <td>ApiVersion</td>
        <td>
          <a
            target="_blank"
            href={`https://github.com/docker/docker/blob/master/docs/reference/api/docker_remote_api_v${this.state.ApiVersion}.md#monitor-dockers-events`}>
            {this.state.ApiVersion}
          </a></td>
      </tr>

      <tr>
        <td colSpan="2"><strong>WebSocket</strong></td>
      </tr>

      <tr>
        <td>connection</td>
        <td>{this.state.status}</td>
      </tr>
      <tr>
        <td>message</td>
        <td>{this.state.messageCount}</td>
      </tr>

      </tbody>
    </table>
  }
}

export default DockerInfo;