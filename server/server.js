const express = require("express");
const WebSocket = require("ws");
const fs = require('fs');
const http = require("http");
const https = require('https');
const app = express();
const capp = express();
var path = require('path');
var {v4:uuidv4} = require('uuid');

const serverConfig = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem'),
};

const HTTPS_PORT = 443;

const port = process.env.PORT || 26950;

//initialize a http server
const server = https.createServer(serverConfig, app);

capp.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..') + '/docs/index.html');
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

let users = new Map();
let schedule = {};

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

function findWeek(year, month, week) {
  var arr = [];
  if (schedule[year] && schedule[year][month] && schedule[year][month][week]) {
    arr = Object.values(schedule[year][month][week]);
  } else {
    if (!schedule[year]) {
      schedule[year] = {}
    }
    if (!schedule[year][month]) {
      schedule[year][month] = {}
    }
    if (!schedule[year][month][week]) {
      schedule[year][month][week] = {}
    }
  }
  var returnMessage = {
    type: "week",
    data: arr
  }
  //return JSON.stringify(returnMessage);
  //console.log(users);
  for (element of users.values()) {
    element.send(JSON.stringify(returnMessage));
  }
}

wss.on("connection", ws => {

  ws.name = uuidv4();
  users.set(ws.name, ws);
  //console.log(users);

  ws.on("message", msg => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.log("Invalid JSON");
      data = {};
    }

    switch (data.type) {
      case "getWeek":
        findWeek(data.year, data.month, data.week);
        break;
      case "createTask":
        console.log(schedule);
        console.log(data.data);

        var [year, month, week] = data.data.date.split("-");
        week = Math.floor(week / 7);
        month = parseInt(month);

        var id = Math.floor(Math.random() * Math.floor(1000));

        if (schedule[year] && schedule[year][month] && schedule[year][month][week]) {
          while(schedule[year][month][week][id] != undefined) {
            id = Math.floor(Math.random() * Math.floor(1000));
          }
          schedule[year][month][week][id] = data.data;
          schedule[year][month][week][id].id = id;
        }

        console.log(schedule[year][month][week]);

        findWeek(year, month, week);
        break;
      default: 
        console.log("uh oh! That's not a valid request!");
        break;
    }

  });

  ws.on("close", function () {
    delete users[ws.name];
    sendToAll(users, "leave", ws);
  });

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