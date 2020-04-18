const EventEmiter = require('events').EventEmitter;
const Player = require('./Player');

class Room extends EventEmiter
{
    constructor(config = {})
    {
        super();

        this.name = config.name || 'unamedRoom';

        console.log('Création de la room', this.name)

        this.size = config.size || 5;
        this.motd = config.motd || `room ${this.name}`;
        this.io = config.io || null;

        this.players = {};

        this.initIO();
    }

    initIO()
    {
        this.io.of(`/${this.name}`).on('connection', (socket) => 
        {
            console.log(`Connection du socket [${socket.id}] a la room [${this.name}]`);

            socket.on('disconnect', (socket) => 
            {
                if(this.players[socket.id])
                {
                    this.emit('playerDisconnect', this.players[socket.id], this);
                    delete this.players[socket.id];
                }
            });
            
            socket.on('join', (playerData = {}) => 
            {
                playerData.socket = socket;
                this.join(playerData);
            });
        })
    }

    join(playerConfig = {})
    {
        // TODO : lorsque le joueur na pas de nom lui donner un nom de type gest#'randomNumber'

        // TODO : verifier si le joueur n'existe pas deja

        if(playerConfig.socket)
        {
            this.players[playerConfig.socket.id] = new Player(playerConfig);
            this.emit('playerConnect', this.players[playerConfig.socket.id], this);
        }
        else
        {
            console.log(`${playerConfig.name} ne peut pas rejoindre la room ${this.name} : invalid socket`);
        }
    }

    get data()
    {
        const playersCount = Object.keys(this.players).length;
        return { name: this.name, size: this.size, playersCount: playersCount, motd: this.motd };
    }
}

module.exports = Room;