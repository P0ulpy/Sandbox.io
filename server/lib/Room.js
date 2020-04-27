const LibraryComponent = require("./LibraryComponent");

/* Une Room est avant la Sandbox : on se connecte à une Room, on a un chat de Room, le message de
la Room (MODT), l'icone de la Room, éventuellement une interface pour les équipes etc...
Puis dès que le jeu commence, la Sandbox associée est démarrée (roomID = SandboxID) et tous les
clients de la Room se connectent à la Sandbox

La Room a besoin de la Sandbox pour fonctionner, puisque c'est la Sandbox qui détermine l'UID,
mais aussi le nombre de joueurs max, les mods installés...
On crée donc une Room depuis une Sandbox : Sandbox.createRoom()
*/

class Room extends LibraryComponent
{
    constructor(config)
    {
        super();

        this.name = config.name;

        this.UID = config.UID;

        this.MOTD = config.MOTD;

        this.size = config.size;

        this.socketManager = new this.constructors.SocketManager(this);

        config.socketManager = this.socketManager;

        this.sandbox = new this.constructors.Sandbox(config);
    }
    
    get data()
    {
        return {
            name: this.name,
            size: this.size,
            clientsCount: this.socketManager.clientsCount,
            MOTD: this.MOTD,
            UID: this.UID
        };
    }
}

module.exports = Room;