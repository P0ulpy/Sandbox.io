const express = require('express');
const app = express();
const server = require('http').createServer(app);

const path = require('path');
const RoomsManager = require('./RoomsManager')

app.use(express.static(path.join(__dirname + '/client')));

server.listen(80);

const roomsManager = new RoomsManager({httpServer: server});