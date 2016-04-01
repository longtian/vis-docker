import React from 'react';
import {findDOMNode} from 'react-dom';
import vis from 'vis';
import {nodes, edges} from './store.es6';

class Network extends React.Component {

  componentDidMount() {
    const graphOptions = {
      height: "600px"
    }


    var graph = new vis.Network(findDOMNode(this), {
      nodes: nodes,
      edges: edges
    }, graphOptions);
  }

  render() {
    return <div className="networkContainer"/>
  }
}

export default Network;