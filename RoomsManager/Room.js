const EventEmiter = require('events').EventEmitter;
const Client = require('./Client');

class Room extends EventEmiter
{
    constructor(config = {})
    {
        super();

        this.IO = config.io;
        this.UID = config.UID;

        this.name = config.name || `room#${this.UID}`    // TODO : faire passer le nom de la room dans un regex pour eviter l'injetion 
        this.motd = config.motd || `Room - ${this.name}`;
        this.size = parseInt(config.size.replace(/[^0-9]+/, '')) || 5;

        this.io = this.IO.of(`/${this.UID}`);

        console.log(`-- Création de la room ${this.UID}:${this.name}`)

        this.clients = {};

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
                if(this.clients[socket.id])
                {
                    console.log(`[${this.UID}:${this.name}] [-] Le joueur [${this.clients[socket.id].name}] a quitter la room`);
                    this.emit('clientDisconnect', this.clients[socket.id].name, this);

                    delete this.clients[socket.id];
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
            // TODO : verifier si il y a de la place dans la room (avec Room.clients)
            // TODO : verifier si le joueur n'existe pas deja

            this.clients[clientData.socket.id] = new Client(clientData);

            console.log(`[${this.UID}:${this.name}] [+] Le joueur [${this.clients[clientData.socket.id].name}] a rejoin la room`);
            this.emit('clientConnect', this.clients[clientData.socket.id], this); 

            clientData.socket.emit('joinResponse', 
            {
                success: true, 
                roomName: this.name, 
                roomUID: this.UID, 
                clientName: this.clients[clientData.socket.id].name
            });
        }
        else
        {
            console.log(`${clientData.name} ne peut pas rejoindre la room ${this.UID}:${this.name} : invalid socket`);
            clientData.socket.close();
        }
    }

    get data()
    {
        const clientsCount = Object.keys(this.clients).length;

        return { name: this.name, size: this.size, clientsCount: clientsCount, motd: this.motd, UID: this.UID};
    }
}

Room.Client = Client;
module.exports = Room;