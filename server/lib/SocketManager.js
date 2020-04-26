const LibraryComponent = require("./LibraryComponent");

/* Puisqu'il va falloir gérer un objet Room et un Sandbox via un seul et unique SocketManager,
on émet des évènements qui seront traités différemment selon qu'on est encore « en mode room »
ou qu'on est en « mode sandbox »
Cet objet SocketManager sera partagé entre Room et Sandbox !!!
*/

// Ici seront gérées toutes les données qui transitent entre les clients et le serveur
class SocketManager extends LibraryComponent
{
    constructor(room)
    {
        super();
        this.room = room;

        this.clients = new Map();

        this.io = this.env.get("socketIO").of(`/${this.room.uniqueID}`);
    }

    get clientsCount()
    {
        return this.clients.size;
    }

    init()
    {
        this.initJoin();
        //this.initModsListener();
        //this.initModsSendProtocol();
    }

    initJoin()
    {
        this.io.on("connection", socket =>
        {
            this.emit("socketConnected", socket);
            this.clients.set(socket.id, socket);

            socket.on("disconnect", (reason) =>
            {
                this.emit("socketDisconnected", socket, reason);
                this.clients.delete(socket.id);
            });
        });
    }

    initModsListener()
    {
        this.sandbox.loadedMods.forEach((mod, uniqueID) =>
        {
            this.debug("note", `Mod ${uniqueID} ready to listen for data...`)
            // 1 namespace par sandbox
            this.io.on("connection", (socket) =>
            {
                this.debug("log", `Socket ${socket.id} connected to mod ${uniqueID}`);

                /* Middleware à partir duquel on va récupérer tous les paquets entrants associés à ce mod,
                puis on va envoyer les informations à ce mod. Le mod n'interagit donc pas directement avec
                les données qui circulent. */
                socket.use((packet, next) =>
                {
                    const event = packet[0], data = packet[1];

                    /* L'évènement "receiveData" est réservé à la réception de données pour les mods */
                    mod.emit("receiveData", event, data);

                    next();
                });
            });
        });
    }

    initModsSendProtocol()
    {
        this.sandbox.loadedMods.forEach((mod, uniqueID) =>
        {
            this.debug("note", `Mod ${uniqueID} ready to send data...`);
            /* L'évènement "sendData" est réservé à l'envoi de données pour les mods */
            mod.on("sendData", (event, data) =>
            {
                this.io.emit(event, data);
            });
        });
    }
}

module.exports = SocketManager;