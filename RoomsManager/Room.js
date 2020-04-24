const EventEmiter = require('events').EventEmitter;
const Player = require('./Player');

class Room extends EventEmiter
{
    constructor(config = {})
    {
        super();

        this.UID = config.UID;

        // TODO : faire passer le nom de la room dans un regex pour eviter l'injetion 
        this.name = config.name || 'room#' + this.UID;
        this.size = config.size || 5;
        this.motd = config.motd || `room ${this.name}`;
        
        this.globalIO = config.io;
        this.io = this.globalIO.of(`/${this.UID}`);

        console.log(`-- Création de la room ${this.UID}:${this.name}`)

        this.players = {};

        this.initIO();
    }

    initIO()
    {
        this.io.on('connection', (socket) => 
        {
            console.log(`[${this.UID}:${this.name}] [~] Connection du socket [${socket.id}] a la room`);
            this.emit('socketConnection', socket, this);

            socket.on('join', (clientData = {}) => 
            {
                clientData.socket = socket;
                this.join(clientData);
            });

            socket.on('disconnect', () => 
            {
                if(this.players[socket.id])
                {
                    console.log(`[${this.UID}:${this.name}] [-] Le joueur [${this.players[socket.id].name}] a quitter la room`);
                    this.emit('playerDisconnect', this.players[socket.id].name, this);

                    delete this.players[socket.id];
                }

                console.log(`[${this.UID}:${this.name}] [~] Déconnexion du socket [${socket.id}] de la room`);
                this.emit('socketDisconnection', socket, this);
            });
        });
    }

    join(clientData = {})
    {
        if(clientData.socket)
        {
            // TODO : verifier si il y a de la place dans la room (avec Room.players)
            // TODO : verifier si le joueur n'existe pas deja

            this.players[clientData.socket.id] = new Player(clientData);

            console.log(`[${this.UID}:${this.name}] [+] Le joueur [${this.players[clientData.socket.id].name}] a rejoin la room`);
            this.emit('playerConnect', this.players[clientData.socket.id], this); 

            clientData.socket.emit('joinResponse', 
            {
                success: true, 
                roomName: this.name, 
                roomUID: this.UID, 
                playerName: this.players[clientData.socket.id].name
            });
        }
        else
        {
            console.log(`${clientData.name} ne peut pas rejoindre la room ${this.UID}:${this.name} : invalid socket`);
        }
    }

    get data()
    {
        const playersCount = Object.keys(this.players).length;

        return { name: this.name, size: this.size, playersCount: playersCount, motd: this.motd, UID: this.UID,};
    }
}

module.exports = Room;