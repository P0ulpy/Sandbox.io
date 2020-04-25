//const LibraryComponent = require("./LibraryComponent");

// Ici seront gérées toutes les données qui transitent entre les clients et le serveur
class SocketManager
{
    constructor(config)
    {
        this.sandbox = config.sandbox;

        this.io = SocketManager.Namespace.getGlobal("socketIO").of(`/${this.sandbox.uniqueID}`);
    }

    initModsListener()
    {
        this.sandbox.loadedMods.forEach((mod, uniqueID) =>
        {
            console.log(`[+] Mod ${uniqueID} ready to listen for data...`);
            // 1 namespace par mod
            this.io.on("connection", (socket) =>
            {
                console.log(`Socket ${socket.id} connected to mod ${uniqueID}`);

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
            console.log(`[+] Mod ${uniqueID} ready to send data...`);
            /* L'évènement "sendData" est réservé à l'envoi de données pour les mods */
            mod.on("sendData", (event, data) =>
            {
                this.io.emit(event, data);
            });
        });
    }
}

module.exports = SocketManager;