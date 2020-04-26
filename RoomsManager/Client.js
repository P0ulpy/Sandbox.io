const EventEmitter = require('events').EventEmitter;

class Client extends EventEmitter
{
    constructor(config = {})
    {
        super();

        if(!config.socket) console.log("invalid arguments : socket is undefined");

        this.socket = config.socket;
        this.name = config.name.replace(/[^a-z0-9]/gi,'') || `player#${this.socket.id}`;
    
        this.initSocketEvents();
    }

    initSocketEvents()
    {

    }

    get data()
    {
        return {name: this.name};
    }
}

module.exports = Client;