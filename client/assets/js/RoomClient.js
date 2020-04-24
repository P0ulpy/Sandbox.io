import EventEmitter from "./vendors/EventEmitter.js"

class RoomClient extends EventEmitter
{
    constructor(config = {}, playerConfig = {})
    {
        super();
        
        this.UID = config.UID;
        this.server = config.server || 'http://localhost:25565';

        this.initSocketEvents();

        this.socket.emit('join', {name: 'robert'});
    }

    initSocketEvents()
    {
        console.log(`Tentative de connection a la room ${this.UID}`);
        this.socket = io.connect(`${this.server}/${this.UID}`);

        this.socket.on('joinResponse', (response) => 
        {
            if(response.success)
            {
                // TODO : faire un truc de ça
                response.playerName;
                this.name = response.roomName;

                console.log(`Connection a la room ${response.roomUID}:${response.roomName} réussie !`);

                this.emit('joinSucces', this);

                // TODO : finir de rejoindre la room (crée et afficher la page de room)
            }
            else
            {
                console.warn(`Echec de la connection a la room ${this.UID} : ${response.error}`);
                this.emit('joinError', error, this);
            }
        });
    }
}

export default RoomClient;