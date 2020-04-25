const express = require('express');
const app = express();
const server = require('http').createServer(app);

const path = require('path');
const RoomsManager = require('./RoomsManager');

app.use(express.static(path.join(__dirname + '/client')));

// permet de generer un acces au variables d'un POST dans req.body 
app.use(express.urlencoded({ extended: false }));
app.set('view-engine', 'ejs');

const roomsManager = new RoomsManager({httpServer: server, express: express, app:app});

server.listen(80);