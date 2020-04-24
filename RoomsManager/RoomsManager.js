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
            // TODO : donner une UUID a la room plutot que d'utiliser un nom

            const UUID = "1";     // TEMP

            if(!this.rooms[UUID])
            {
                this.rooms[UUID] = new Room({name: config.name, io: this.io, UUID:UUID});

                socket.emit('createRoomResponse', 
                {
                    success: true, 
                    roomUUID: this.rooms[UUID].UUID, 
                    roomName: this.rooms[UUID].name
                });
            }
            else
            {
                socket.emit('createRoomResponse', {success: false, roomName: config.name, errorMessage: "UUID is not unique !!! (big bobo)"});
            }
        });

        socket.on('getRooms', () => 
        {
            const roomsData = {};
            
            for(const room of Object.keys(this.rooms))
            {
                roomsData[room] = this.rooms[room].data;
            }

            socket.emit('getRoomsResponse', roomsData);
        });
    }
}

module.exports = RoomsManager;