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

let users = [];
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
    arr = schedule[year][month][week];
  } else {
    if (!schedule[year]) {
      schedule[year] = {}
    }
    if (!schedule[year][month]) {
      schedule[year][month] = {}
    }
    if (!schedule[year][month][week]) {
      schedule[year][month][week] = []
    }
  }
  var returnMessage = {
    type: "week",
    data: arr
  }
  //return JSON.stringify(returnMessage);
  console.log(users);
  users.forEach(element => {
    element.send(JSON.stringify(returnMessage));
  });
}

wss.on("connection", ws => {

  users.push(ws);

  ws.on("message", msg => {
    let data = JSON.parse(msg);
    console.log(data);
    if (data.type == "getWeek") {
      findWeek(data.year,data.month,data.week);
      //ws.send(findWeek(data.year,data.month,data.week));
    }
    else if (data.type == "createTask") {

      console.log(schedule);

      var [year, month, week] = data.data.date.split("-");
      week = Math.floor(week/7);
      month = parseInt(month);

      if (schedule[year] && schedule[year][month] && schedule[year][month][week]) {
        schedule[year][month][week].push(data.data);
      }

      console.log(schedule[year][month][week]);

      findWeek(year,month,week);

      //ws.send(findWeek(year,month,week));
      
      /*
      var returnMessage = {
        type: "week",
        data: arr
      }
      ws.send(JSON.stringify(returnMessage))*/
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