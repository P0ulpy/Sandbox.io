const socketIO = require('socket.io');
const EventEmitter = require('events').EventEmitter;

const Room = require('./Room');

class JoiningSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        this.httpServer = config.httpServer || null;

        // TODO : reflechir a un systeme plus malinx qu'un objet pour stocker les rooms
        this.rooms = {};

        this.initSocketIO();
    }

    initSocketIO() {
        this.io = socketIO(this.httpServer);

        this.io.on('connection', (socket) => {
            console.log('Connection du socket', socket.id);
            this.initSocket(socket);
        });
    }

    initSocket(socket) {
        socket.on('getRoom', () => {

            
            let data = [];

           
        
            for (var i in this.rooms) {
              
               data.push({name : this.rooms[i].name, size :this.rooms[i].size, motd : this.rooms[i].motd })
               //console.log(this.rooms[i].size, this.rooms[i].name, this.rooms[i].motd);

               //Renvoie le nom de la room correspondant à la clé dans le tableau roomNames
            }
            console.log(data[0].name);

            socket.emit('getRoomresponse', { data : data
                 
                
            });

        })
        socket.on('disconnect', () => {
            console.log('Deconnection du socket', socket.id);
        });

        socket.on('createRoom', (config = {}) => {
            // TEMPORAIRE
            // TODO : verifier si la room existe deja
            if (true) {
                this.rooms[config.name] = new Room({
                    name: config.name,
                    io: this.io
                });
                this.rooms[config.name].on('playerDisconnect', (player, room) => {
                    console.log(`[-] Le joueur ${player.name} a quitter la room [${room.name}]`);
                });
                this.rooms[config.name].on('playerConnect', (player, room) => {
                    console.log(`[+] Le joueur ${player.name} a rejoin la room [${room.name}]`);
                });


                socket.emit('createRoomResponse', {
                    success: true,
                    roomName: config.name
                });
            } else {
                console.error(`${socket.id} essaye de crée la room ${roomName} : elle existe deja`);
                socket.emit('createRoomResponse', {
                    success: false,
                    roomName: config.name,
                    errorMessage: "room name taken"
                });
            }
        });
    }
}

JoiningSystem.Room = Room;

module.exports = JoiningSystem;