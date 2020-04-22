const EventEmitter = require("events").EventEmitter;
//const Environment = require("./Environment");
//const GameObject = require("./GameObject");
const SocketManager = require("./SocketManager");
const ModParser = require("./ModParser");
const ServerMod = require("./ServerMod");

class Sandbox extends EventEmitter
{
    constructor(config = {})
    {
        super();

        // Vitesse de rafraichissement : update
        this.updateRate = config.updateRate || 30;

        // Liste des mods à charger, tableau de strings : leurs IDs
        this.mods = config.mods || [];

        const socketConfig = {
            sandbox: this,
            httpServer: config.httpServer || null
        };
        this.socketManager = new SocketManager(socketConfig);

        this.loadMods();

        // Données propres à chaque client : espace réservé, ici qu'on va stocker l'instance de Player
        // Chaque client sera désigné par son id de connexion (socket.id) qui est le même peu importe le namespace
    }

    loadMods()
    {
        const modParser = new ModParser(this, this.mods);
        modParser.on("modLoadSuccess", (mod) => { console.log(`[+] Mod ${mod.uniqueID} chargé`); });
        modParser.on("modLoadError", (modID, err) => { console.log(`[-] Mod ${modID} non chargé : ${err.message}`); });
        modParser.on("modLoadFinish", (loadedMods) =>
        {
            this.loadedMods = loadedMods;
            console.log(`[+] ${loadedMods.length} mods chargés au total`);
            this.initSocketManager();

            this.loadedMods.forEach((mod) =>
            {
                console.log(mod);
            });
        });
        modParser.parse();
    }

    initSocketManager()
    {
        this.socketManager.initModsListener();
        this.socketManager.initModsSendProtocol();
    }

    init()
    {
        if (this.autoStart)
        {
            this.startUpdateLoop();

            if (this.httpServer)
            {
                this.initSocket();
            }
        }
    }

    startUpdateLoop()
    {
        setInterval(() =>
        {
            this.emit("update");
        }, this.updateRate);
    }
}

Sandbox.ServerMod = ServerMod;
Sandbox.ModParser = ModParser;

module.exports = Sandbox;