import React from "react";
import "vis/dist/vis.css";
import "purecss/build/pure.css";
import "./style.css";
import DockerInfo from "./DockerInfo.jsx";
import {render} from "react-dom";
import Timeline from "./Timeline.jsx";
import Network from "./Network.jsx";
/**
 * WebSocketContainer is used to receive messages from backend
 * Timeline and Network is as its name
 */
class App extends React.Component {

  handleChange(e) {
    this.refs.timeline.contentKeyword = e.target.value;
    this.refs.timeline.filteredNodes.refresh();
  }

  render() {
    return <div className="pure-g">
      <div className="pure-u-2-3">
        <Timeline ref="timeline"/>
      </div>
      <div className="pure-u-1-3">
        <form className="pure-form">
          <input style={{width:"100%"}}
                 type="search"
                 placeholder="Filter Name and Type"
                 onChange={this.handleChange.bind(this)}/>
        </form>
        <Network/>
        <DockerInfo/>
      </div>
    </div>
  }
}

var element = document.createElement("div");
document.body.appendChild(element);
render(<App/>, element);