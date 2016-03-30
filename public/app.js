var items = new vis.DataSet();
var groups = new vis.DataSet();
var edges = new vis.DataSet();

var container = document.getElementById('visualization');
var graphContainer = document.getElementById('graph');

var timelineOptions = {
  margin: -10,
  orientation: 'both',
  stack: true,
  zoomMax: 6 * 3600000,
  order: function (a, b) {
    var a = "" + a.id;
    var b = "" + b.id;
    if (a > b) {
      return -1
    } else if (a == b) {
      return 0
    } else {
      return 1
    }
  },
  max: Date.now() + 24 * 3600000,
  height: $(window).height() - 20 + 'px'
};

var graphOptions = {
  height: $(window).height() - 20 + 'px'
}


var timeline = new vis.Timeline(container, items, groups, timelineOptions);

var graph = new vis.Network(graphContainer, {
  nodes: groups,
  edges: edges
}, graphOptions);

var ts = function (str) {
  return Math.round(+(new Date(str)) / 1000);
}

var onRangeChange = function (properties) {

  // items.clear();
  // groups.clear();
  // edges.clear();

  var start = ts(properties.start);
  var end = ts(properties.end);
  var now = Math.floor((+new Date) / 1000);

  $.getJSON('/events', {
    since: start < now ? start : now,
    until: end < now ? end : now
  }).done(function (res) {
    res.forEach(onEvent);
  })
}

function shorten(str) {
  str = str || "";
  return str.slice(0, 8);
}

function destroyNode(id) {
  var destroyNodes = groups.get([id])[0];
  if (destroyNodes) {
    groups.update({
      id: id,
      color: "#ccc"
    })
  }
}

function onEvent(event) {

  var itemId = event.timeNano;
  var itemContent = event.status || event.Action;

  var groupId = event.id || event.Actor.ID;
  var groupContent = event.Type + ':';

  try {
    if (event.Type == "container") {
      groupContent += shorten(event.id);

      if (event.Action == "destroy") {
        destroyNode(groupId);
      }

    } else if (event.Type == "image") {
      groupContent += event.Actor.Attributes.name
    } else if (event.Type == "network") {
      groupContent += shorten(event.Actor.ID)

      var edgeId = event.Actor.Attributes.container + event.Actor.ID;
      if (!edges.get(edgeId)) {
        edges.add({
          id: edgeId,
          from: event.Actor.Attributes.container,
          to: event.Actor.ID,
          arrows: "to"
        })
      }

    } else if (event.Type == "volume") {
      groupContent += shorten(event.Actor.ID);

      var edgeId = event.Actor.Attributes.container + event.Actor.ID;
      if (!edges.get(edgeId)) {
        edges.add({
          id: edgeId,
          from: event.Actor.Attributes.container,
          to: event.Actor.ID,
          arrows: "to"
        })
      }

      if (event.Action == "unmount") {
        destroyNode(groupId);
      }

    }
  } catch (e) {
    console.error(arguments);
  }


  if (!items.get(itemId)) {

    if (!groups.get(groupId)) {
      groups.add({
        id: groupId,
        content: groupContent,
        label: groupContent
      });
    }

    items.add({
      id: itemId,
      content: itemContent,
      start: event.timeNano / 1000000,
      group: groupId,
      subGroup: event.status,
      event: event,
      type: "point"
    });
  }

  if (!items.get(event.from)) {
    var fromId = event.from

    if (!groups.get(fromId)) {
      groups.add({
        id: fromId,
        content: fromId,
        label: fromId
      });
    }

    var edgeId = groupId + event.from;

    if (!edges.get(edgeId)) {
      edges.add({
        id: edgeId,
        from: groupId,
        to: event.from,
        arrows: "to"
      })
    }


  }
}


timeline.on('rangechanged', onRangeChange);

timeline.moveTo(new Date);

timeline.on('select', function (e) {
  var selectedItems = items.get(e.items);
  console.info(selectedItems[0], selectedItems[0].event);
  graph.selectNodes([selectedItems[0].group]);
});

var socket = new WebSocket('ws://' + location.host);
socket.addEventListener('message', function (e) {
  onEvent(JSON.parse(e.data));
});