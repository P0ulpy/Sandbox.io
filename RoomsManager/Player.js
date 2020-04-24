const EventEmitter = require('events').EventEmitter;

class Player extends EventEmitter
{
    constructor(config = {})
    {
        super();

        if(!config.socket) console.log("invalid arguments : socket is undefined");

        // TODO : lorsque le joueur na pas de nom lui donner un nom de type gest#UID
        this.name = config.name || 'unamedPlayer';
        this.socket = config.socket;
    
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

module.exports = Player;