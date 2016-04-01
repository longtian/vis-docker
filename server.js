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

const wss = new WebSocketServer({
  server: server
});

var fallback = 2;

/**
 * error handler for docker events stream
 *
 * @param error
 */
const reconnectEvents = (error)=> {
  if (error) {
    console.error(error);
  }
  console.error('disconnected, wait %d seconds to reconnect', fallback);
  setTimeout(listenForEvents, fallback * 1000);
  // increase fall back
  fallback = fallback < 257 ? fallback * 2 : 120;
}


/**
 * begin listening and forwarding docker events
 */
const listenForEvents = ()=> {
  let longLiveRequest = http.request(
    Object.assign(connectionOptions, {
      path: '/events'
    }), res=> {
      fallback = 2;
      console.log('Connected to docker daemon, reset fallback to %d', fallback);
      res.pipe(es.split())
        .pipe(es.map((data, cb)=> {
          wss.clients.forEach(client=> {
            client.send(data);
          })
          cb(null, data);
        }));
    });
  longLiveRequest.end();
  longLiveRequest.on('error', reconnectEvents);
  longLiveRequest.on('close', reconnectEvents);
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

/**
 * forward version api
 */
app.get('/version', (req, res)=> {

  let infoRequest = http.request(
    Object.assign(connectionOptions, {
      path: '/version'
    }), response=> {
      response.pipe(res);
    });

  infoRequest.on('error', (err)=> {
    console.error(err);
    res.statusCode = 502;
    res.end();
  });

  infoRequest.end();
});

app.use(webpackDevMiddleware(webpack(require('./webpack.config'))));
server.on('request', app);

listenForEvents();
server.listen(3000, function () {
  console.log('Listening on port %d', server.address().port);
});
