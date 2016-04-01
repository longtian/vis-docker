import React from 'react';
import {findDOMNode} from 'react-dom';
import vis from 'vis';
import {groups, edges} from './store.es6';
import {graphOptions} from './config.es6';

class Network extends React.Component {

  componentDidMount() {
    var graph = new vis.Network(findDOMNode(this), {
      nodes: groups,
      edges: edges
    }, graphOptions);
  }

  render() {
    return <div className="networkContainer"/>
  }
}

export default Network;