const express = require('express');
const app = express();
const server = require('http').createServer(app);

const path = require('path');
<<<<<<< HEAD
const JoiningSystem = require('./JoiningSystem')

app.use(express.static(path.join(__dirname + '/client')));
// TODO : On peut pas enlever ce qu'il ya entre commentaire la ?


/*
app.use('/client', express.static(path.join(__dirname + '/client')));

app.get('/', (req, res) =>
{
    res.sendFile(path.join(__dirname + '/client/game.html'));
});*/

server.listen(25565);

const joiningSystem = new JoiningSystem({httpServer: server});
=======
const RoomsManager = require('./RoomsManager')

app.use(express.static(path.join(__dirname + '/client')));

server.listen(25565);

const roomsManager = new RoomsManager({httpServer: server});
>>>>>>> parent of 2aae01e... push vide repo
