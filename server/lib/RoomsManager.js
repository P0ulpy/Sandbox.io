const socketIO = require('socket.io');

const LibraryComponent = require("./LibraryComponent");

class RoomsManager extends LibraryComponent
{
    constructor(config = {})
    {
        super();

        this.rooms = new Map();

        this.app = this.env.get("app");
        this.io = this.env.get("socketIO");
    }

    add(room)
    {
        this.rooms.set(room.UID, room);
        return this;
    }

    has(UID)
    {
        return this.rooms.has(UID);
    }

    get(UID)
    {
        return this.rooms.get(UID);
    }

    forEach(callback)
    {
        this.rooms.forEach((room, UID) => callback(room, UID));
    }

    getRoomsData()
    {
        const roomsData = [];

        this.forEach(room => roomsData.push(room.data));
 
        return roomsData;
    }
}

module.exports = RoomsManager;