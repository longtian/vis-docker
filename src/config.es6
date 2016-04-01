export const timelineOptions = {
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
  height: "800px"
}

export const graphOptions = {
  height: "800px"
}