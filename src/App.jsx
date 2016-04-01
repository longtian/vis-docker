import React from 'react';
import 'vis/dist/vis.css';
import './style.css';
import WebSocketContainer from './WebSocketContainer.jsx';
import {render} from 'react-dom';
import Timeline from './Timeline.jsx';
import Network from './Network.jsx';

/**
 * WebSocketContainer is used to receive messages from backend
 * Timeline and Network is as its name
 */
class App extends React.Component {
  render() {
    return <div>
      <div>
        <WebSocketContainer/>
      </div>
      <div>
        <Timeline/>
        <Network/>
      </div>
    </div>
  }
}

var element = document.createElement("div");
document.body.appendChild(element);
render(<App/>, element);