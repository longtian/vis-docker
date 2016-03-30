const http = require('http');
const express = require('express');
const path = require('path');
const es = require('event-stream');
const qs = require('querystring');
const concat = require('concat-stream');
const WebSocketServer = require('ws').Server;

var app = express();
var server = http.createServer();
var wss = new WebSocketServer({
  server: server
});

http.request({
  socketPath: '/var/run/docker.sock',
  path: '/events'
}, res=> {
  res.pipe(es.split()).pipe(es.map((data, cb)=> {
    wss.clients.forEach(client=> {
      client.send(data);
    })
    cb(null, data)
  }))
}).end()

app.get('/events', (req, res)=> {

  if (!req.query.since || !req.query.until) {
    res.statusCode = 400;
    res.end('since and until parameters must be provided');
  }

  var eventsRequest = http.request({
    socketPath: '/var/run/docker.sock',
    path: '/events?' + qs.stringify(req.query)
  }, response=> {
    response.pipe(concat(function (logBuffer) {
      if (logBuffer.length) {
        var text = "[" + logBuffer.toString().split('\n').join(',').replace(/,$/, ']');
        res.end(text);
      } else {
        res.end('[]');
      }

    }))
  });

  eventsRequest.on('error', (err)=> {
    console.error(err);
    res.statusCode = 502;
    res.end();
  });

  eventsRequest.end();
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/static', express.static(path.join(__dirname, 'node_modules', 'vis', 'dist')));
app.use('/static', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));

server.on('request', app);

server.listen(3000);
