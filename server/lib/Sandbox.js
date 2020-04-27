const LibraryComponent = require("./LibraryComponent");

class Sandbox extends LibraryComponent
{
    constructor(config = {})
    {
        super();

        // Que Sandbox : Vitesse de rafraichissement : update
        this.updateRate = config.updateRate || 30;

        // Commun : Liste des mods à charger, tableau de strings : leurs IDs
        this.mods = config.mods || [];

        // Commun
        this.UID = config.UID;

        // Que Sandbox
        this.sandboxPath = config.sandboxPath;

        // Commun
        this.socketManager = config.socketManager;

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
        modParser.on("modLoadSuccess", (mod) => { this.debug("note", `Mod #${mod.UID} chargé`); });
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
            this.debug("log", `Socket ${socket.id} connected to Sandbox #${this.UID}`);
        });
        this.socketManager.on("socketDisconnected", (socket, reason) =>
        {
            this.debug("log", `Socket ${socket.id} disconnected from #${this.UID} : ${reason}`);
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