import {nodes, edges, events} from './store.es6';
import {shorten} from './util.es6';

const destroyNode = id=> {
  var destroyNodes = nodes.get([id])[0];
  if (destroyNodes) {
    nodes.update({
      id: id,
      color: "#ccc",
      borderWidthSelected: 1
    })
  }
}

/**
 *
 * @param event
 */
const createEvent = event=> {
  let nodeId = event.id || event.Actor.ID; // for connect and unmount events
  events.add({
    id: event.timeNano,
    className: event.Action,
    content: event.Action,
    start: event.timeNano / 1E6,
    group: nodeId,
    event: event,
    type: "point"
  });
}

/**
 *
 * @param event
 */
const createOrUpdateNode = event=> {
  let nodeId = event.id || event.Actor.ID; // for connect and unmount events
  if (!nodes.get(nodeId)) {

    let {
      name=shorten(nodeId)
    } = event.Actor.Attributes;

    nodes.add({
      id: nodeId,
      content: `<strong>${event.Type}</strong><br/>${name}`,
      label: `${event.Type}:${name}`
    })
  }

  nodes.update({
    id: nodeId,
    title: event.Action
  })


  switch (event.Action) {
    case "destroy":
      destroyNode(nodeId);
      break;
    case "disconnect":
      destroyEdge(event);
      break;
    case "unmount":
      destroyNode(nodeId);
      destroyEdge(event);
      break;
  }

}


/**
 *
 * @param event
 */
const createOrUpdateEdge = event=> {
  var edgeId = event.Actor.Attributes.container + event.Actor.ID;
  if (!edges.get(edgeId)) {
    edges.add({
      id: edgeId,
      from: event.Actor.Attributes.container,
      to: event.Actor.ID,
      arrows: "to"
    })
  }
}

const destroyEdge = event=> {
  var edgeId = event.Actor.Attributes.container + event.Actor.ID;
  if (edges.get(edgeId)) {
    edges.update({
      id: edgeId,
      dashes: true,
      label: event.Action,
      color: "#ccc",
      font: {
        color: "#ccc"
      }
    })
  }
}

export const onEvent = (event)=> {
  let eventId = event.timeNano;
  let groupId = event.id || event.Actor.ID;
  let groupContent = event.Type + ':'

  if (!events.get(eventId)) {
    createEvent(event);
  }

  switch (event.Type) {
    case "container":
    case "image":
      createOrUpdateNode(event);
      break;
    case "network":
    case "volume":
      createOrUpdateNode(event);
      createOrUpdateEdge(event);
  }

  return;
}