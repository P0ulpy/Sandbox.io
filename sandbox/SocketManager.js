const socket = require("socket.io");

// Ici seront gérées toutes les données qui transitent entre les clients et le serveur
class SocketManager
{
    constructor(config)
    {
        this.sandbox = config.sandbox;

        this.httpServer = config.httpServer;
        this.io = socket(this.httpServer);
    }

    initModsListener()
    {
        this.sandbox.loadedMods.forEach((mod, uniqueID) =>
        {
            console.log(`[+] Listening for mod ${uniqueID}...`);
            // 1 namespace par mod
            this.io.of(`/${uniqueID}`).on("connection", (socket) =>
            {
                console.log(`Socket ${socket.id} connected to mod ${uniqueID}`);

                /* Middleware à partir duquel on va récupérer tous les paquets entrants associés à ce mod,
                puis on va envoyer les informations à ce mod. Le mod n'interagit donc pas directement avec
                les données qui circulent. */
                socket.use((packet, next) =>
                {
                    const event = packet[0];
                    const data = packet[1];

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
            console.log(`[+] Setting up sending protocol for mod ${uniqueID}`);
            /* L'évènement "sendData" est réservé à l'envoi de données pour les mods */
            mod.on("sendData", (event, data) =>
            {
                this.io.of(`/${uniqueID}`).emit(event, data);
            });
        });
    }
}

module.exports = SocketManager;