const socketIO = require('socket.io');
const EventEmitter = require('events').EventEmitter;

const Room = require('./Room');

class RoomsManager extends EventEmitter
{
    constructor(config = {})
    {
        super();
        this.httpServer = config.httpServer || null;
        
        // TODO : reflechir a un systeme plus malinx qu'un objet pour stocker les rooms
        this.rooms = {};

        this.io = socketIO(this.httpServer);

        this.io.on('connection', (socket) => 
        {
            console.log('Connection du socket', socket.id);
            this.initOneSocket(socket);
        });
    }

    initOneSocket(socket)
    {
        socket.on('disconnect', () => 
        {
            console.log('Deconnection du socket', socket.id);
        });

        socket.on('createRoom', (config = {}) => 
        {
            // TODO : donner une UID a la room plutot que d'utiliser un nom
            //J'ai fais un randomizer du roomUID un peu marrant
            
            let randomLetter = Math.random().toString(36).substring(7);
            let randomNumber = Math.floor((Math.random() * 1000) + 1);
            let uidRandomizer = randomNumber + randomLetter;
            const UID = uidRandomizer;

            if(!this.rooms[UID])
            {
                this.rooms[UID] = new Room({name: config.name, io: this.io, UID:UID});

                socket.emit('createRoomResponse', 
                {
                    success: true, 
                    roomUID: this.rooms[UID].UID, 
                    roomName: this.rooms[UID].name
                });
            }
            else
            {
                socket.emit('createRoomResponse', {success: false, roomName: config.name, errorMessage: "UID is not unique !!! (big bobo)"});
            }
        });

        socket.on('getRooms', () => 
        {
            const roomsData = {};
            
            for(const room in this.rooms)
            {
                roomsData[room] = this.rooms[room].data;
            }

            socket.emit('getRoomsResponse', roomsData);
        });
    }
}

module.exports = RoomsManager;