const express = require("express");
const WebSocket = require("ws");
const fs = require('fs');
const http = require("http");
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const app = express();
const capp = express();
var path = require('path');

const serverConfig = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem'),
};

const port = 26950;

const HTTPS_PORT = 443;

capp.get('/', function(req, res) {
  res.sendFile(path.join(__dirname,'..') + '/docs/index.html');
});

capp.use(express.static('docs'))

const httpsServer = https.createServer(serverConfig, capp);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');

//initialize a http server
const server = https.createServer(serverConfig, app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let users = [];

const sendTo = (connection, message) => {
  connection.send(JSON.stringify(message));
};

const sendToAll = (clients, type, { id, name: userName }) => {
  Object.values(clients).forEach(client => {
    if (client.name !== userName) {
      client.send(
        JSON.stringify({
          type,
          user: { id, userName }
        })
      );
    }
  });
};

wss.on('connection', function connection(ws) {
  users.push(ws);
  
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');

  console.log("connection!");
});

//start our server
server.listen(port, () => {
  console.log(`Server running on: wss://blueserver.us.to:${port}`);
});