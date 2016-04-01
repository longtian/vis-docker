import React from "react";
import {findDOMNode} from "react-dom";
import {events, nodes} from "./store.es6";
import {onEvent} from './eventHandlers.es6';
import vis from "vis";
import $ from "jquery";
import {timestamp} from "./util.es6";
import {stringify} from "querystring";

class Timeline extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      href: "#"
    }
    this.contentKeyword = "";
  }

  componentDidMount() {

    const timelineOptions = {
      margin: -5,
      orientation: 'top',
      stack: true,
      zoomMax: 6 * 3600000,
      order: function (a, b) {
        var a = "" + a.id;
        var b = "" + b.id;
        if (a > b) {
          return 1
        } else if (a == b) {
          return 0
        } else {
          return -1
        }
      },
      max: Date.now() + 24 * 3600000,
      height: "740px"
    }

    this.filteredNodes = new vis.DataView(nodes, {
      filter: a=> {
        return a.content.toLowerCase().indexOf(this.contentKeyword.toLowerCase()) != -1;
      }
    });

    let timeline = new vis.Timeline(this.refs.container, events, this.filteredNodes, timelineOptions);
    timeline.on('rangechanged', this.handleRangeChange.bind(this));
    timeline.moveTo(new Date);
    // @todo interaction between different graphs
    // timeline.on('select', function (e) {
    //   var selectedItems = items.get(e.items);
    //   console.info(selectedItems[0], selectedItems[0].event);
    //   graph.selectNodes([selectedItems[0].group]);
    // });
  }

  handleRangeChange(properties) {
    let since = timestamp(properties.start);
    let until = timestamp(properties.end);
    let now = Math.floor((+new Date) / 1000);

    if (since > now) {
      since = now;
    }

    if (until > now) {
      until = now;
    }

    let href = '/events?' + stringify({
        since,
        until
      });

    // show direct link to events API
    this.setState({
      href
    })

    $.getJSON(href)
      .done((res) => {
        res.forEach(onEvent);
      })
  }

  render() {
    return <div>
      <div ref="container"/>
      <a style={{color:"#ccc"}} target="_blank" href={this.state.href}>
        <small>{window.location.host}{this.state.href}</small>
      </a>
    </div>
  }
}
export default Timeline;