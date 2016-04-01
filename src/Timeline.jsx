import React from 'react';
import {findDOMNode} from 'react-dom';
import {items, groups, onEvent} from './store.es6';
import vis from 'vis';
import $ from 'jquery';
import {timelineOptions} from './config.es6';
import {timestamp} from './util.es6';

class Timeline extends React.Component {
  componentDidMount() {
    var timeline = new vis.Timeline(findDOMNode(this), items, groups, timelineOptions);
    timeline.on('rangechanged', this.handleRangeChange.bind(this));
    timeline.moveTo(new Date);
    // timeline.on('select', function (e) {
    //   var selectedItems = items.get(e.items);
    //   console.info(selectedItems[0], selectedItems[0].event);
    //   graph.selectNodes([selectedItems[0].group]);
    // });
  }
  
  handleRangeChange(properties) {
    var start = timestamp(properties.start);
    var end = timestamp(properties.end);
    var now = Math.floor((+new Date) / 1000);
    $.getJSON('/events', {
      since: start < now ? start : now,
      until: end < now ? end : now
    }).done((res) => {
      res.forEach(onEvent);
    })
  }

  render() {
    return <div className="timelineContainer"/>
  }
}
export default Timeline;