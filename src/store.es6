import {DataSet} from "vis";
import {shorten} from "./util.es6";

const items = new DataSet();
const groups = new DataSet();
const edges = new DataSet();

export {
  items,
  groups,
  edges
}


const destroyNode = id=> {
  var destroyNodes = groups.get([id])[0];
  if (destroyNodes) {
    groups.update({
      id: id,
      color: "#ccc"
    })
  }
}


export const onEvent = (event)=> {
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