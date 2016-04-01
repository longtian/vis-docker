"use strict";

const http = require('http');
const express = require('express');
const path = require('path');
const es = require('event-stream');
const qs = require('querystring');
const concat = require('concat-stream');
const WebSocketServer = require('ws').Server;
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpack = require("webpack");

const app = express();
const server = http.createServer();

const connectionOptions = {
  socketPath: '/var/run/docker.sock'
};


/**
 * begin listening and forwarding docker events
 */
const listenForEvents = ()=> {
  let wss = new WebSocketServer({
    server: server
  });
  let longLiveRequest = http.request(
    Object.assign(connectionOptions, {
      path: '/events'
    }), res=> {
      res.pipe(es.split())
        .pipe(es.map((data, cb)=> {
          wss.clients.forEach(client=> {
            client.send(data);
          })
          cb(null, data);
        }));
    });
  longLiveRequest.end();
  longLiveRequest.on('error', error=> {
    console.error(error);
  })
}

/**
 * forward events api
 */
app.get('/events', (req, res)=> {

  if (!req.query.since || !req.query.until) {
    res.statusCode = 400;
    res.end('since and until parameters must be provided');
  }

  let eventsRequest = http.request(
    Object.assign(connectionOptions, {
      path: '/events?' + qs.stringify(req.query)
    }), response=> {
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
});

app.use(webpackDevMiddleware(webpack(require('./webpack.config'))));
server.on('request', app);

listenForEvents();
server.listen(3000, function () {
  console.log('Listening on port %d', server.address().port);
});
