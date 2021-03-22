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

const HTTPS_PORT = 443;

const port = process.env.PORT || 26950;

//initialize a http server
const server = https.createServer(serverConfig, app);

capp.get('/', function(req, res) {
  res.sendFile(path.join(__dirname,'..') + '/docs/index.html');
});

capp.use(express.static('docs'))

const httpsServer = https.createServer(serverConfig, capp);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');


http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);


//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let users = {};

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

wss.on("connection", ws => {
  ws.on("message", msg => {
    console.log(msg);
  });
  ws.on("close", function() {
    delete users[ws.name];
    sendToAll(users, "leave", ws);
  });
  //send immediatly a feedback to the incoming connection
  ws.send(
    JSON.stringify({
      type: "connect",
      message: "Woohoo! You're connected!"
    })
  );
});

//start our server
server.listen(port, () => {
  console.log(`Signalling Server running on port: ${port}`);
});