const path = require("path");
const fs = require("fs");
const EventEmitter = require("events").EventEmitter;
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

        this.uniqueID = config.uniqueID;

        this.sandboxPath = config.sandboxPath;

        // Instance de httpServer
        if (!Sandbox.globals.httpServer)
        {
            throw new Error("httpServer global must be defined");
        }
        this.httpServer = Sandbox.globals.httpServer;

        // Instance de Express
        if (!Sandbox.globals.app)
        {
            throw new Error("App global must be defined");
        }
        this.app = config.app;

        const socketConfig = {
            sandbox: this,
            httpServer: this.httpServer
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

    static instanciateFromDirectory(sandboxPath)
    {
        return new Promise((resolve, reject) =>
        {
            console.log(`[+] Parsing ${sandboxPath} sandbox directory...`);
            const sandboxConfigPath = path.join(sandboxPath, "sandboxconfig.json");

            /*
                Toutes les opérations I/O doivent être asynchrones pour des raisons de performances.
                Il faut donc utiliser des fonctions asynchrones chaque fois que possible.
            */
            fs.readFile(sandboxConfigPath, "utf-8", (err, data) =>
            {
                if (err) reject(err);
                else
                {
                    const sandboxConfig = JSON.parse(data);
                    const sandboxFile = path.join(sandboxPath, sandboxConfig.server || "server");

                    sandboxConfig.sandboxPath = sandboxPath;

                    resolve(new (require(sandboxFile))(sandboxConfig));
                }
            });
        });
    }
}

Sandbox.globals = {};

Sandbox.ServerMod = ServerMod;
Sandbox.ModParser = ModParser;

module.exports = Sandbox;