const express = require('express');
const app = express();
const server = require('http').createServer(app);

const path = require('path');
const JoiningSystem = require('./JoiningSystem')

app.use(express.static(path.join(__dirname + '/client')));

/*
app.use('/client', express.static(path.join(__dirname + '/client')));

app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname + '/client/game.html'));
});*/

server.listen(25565);

const joiningSystem = new JoiningSystem({httpServer: server});