const path = require("path");
const fs = require("fs");
const LibraryComponent = require("./LibraryComponent");

class Sandbox extends LibraryComponent
{
    constructor(config = {})
    {
        super();

        // Vitesse de rafraichissement : update
        this.updateRate = config.updateRate || 30;

        // Liste des mods à charger, tableau de strings : leurs IDs
        this.mods = config.mods || [];

        this.uniqueID = config.uniqueID;

        this.sandboxPath = config.sandboxPath;

        // Instance de httpServer
        if (!this.env.has("httpServer"))
        {
            throw new Error("httpServer global must be defined");
        }
        this.httpServer = this.env.get("httpServer");

        // Instance de Express
        if (!this.env.has("app"))
        {
            throw new Error("App global must be defined");
        }
        this.app = this.env.get("app");

        this.socketManager = new this.constructors.SocketManager(this);

        this.loadMods();

        // Données propres à chaque client : espace réservé, ici qu'on va stocker l'instance de Player
        // Chaque client sera désigné par son id de connexion (socket.id) qui est le même peu importe le namespace
    }

    get data()
    {
        return {
            name: this.name,

        };
    }

    loadMods()
    {
        const modParser = new this.constructors.ModParser(this, this.mods);
        modParser.on("modLoadSuccess", (mod) => { this.debug("note", `Mod #${mod.uniqueID} chargé`); });
        modParser.on("modLoadError", (modFolder, err) => { this.debug("error", `Dossier de mod ${modFolder} non chargé : ${err.message}`); });
        modParser.on("modLoadFinish", (loadedMods) =>
        {
            this.loadedMods = loadedMods;
            this.debug("note", `${loadedMods.length} mods chargés au total`);
            this.socketManager.init();
            this.initEvents();
        });
        modParser.parse();
    }

    initEvents()
    {
        this.socketManager.on("socketConnected", socket =>
        {
            this.debug("log", `Socket ${socket.id} connected to Sandbox #${this.uniqueID}`);
        });
        this.socketManager.on("socketDisconnected", (socket, reason) =>
        {
            this.debug("log", `Socket ${socket.id} disconnected from #${this.uniqueID} : ${reason}`);
        });
    }

    startUpdateLoop()
    {
        setInterval(() =>
        {
            this.emit("update");
        }, this.updateRate);
    }
}

module.exports = Sandbox;