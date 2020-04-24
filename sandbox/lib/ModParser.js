const ServerMod = require("./ServerMod");
const path = require("path");
// Pollyfill de Promise.allSettled() qui n'est pas encore disponible sur Node.JS
const allSettled = require("promise.allsettled");
const EventEmitter = require("events").EventEmitter;
const ModsCollection = require("./ModsCollection");


class ModParser extends EventEmitter
{
    constructor(sandbox, modsList, modsPath = ModParser.Namespace.getGlobal("modPath"))
    {
        super();

        this.sandbox = sandbox;

        this.loadedMods = new ModsCollection();

        // Suppression des doublons
        this.modsList = Array.from(new Set(modsList));
        this.modsPath = modsPath;
    }

    parse()
    {
        // Liste de toutes les promesses de instanciateMod()
        const pendingPromises = [];
        // Utilisation de chemins absolus pour limiter les erreurs de chemins
        const modsPath = path.resolve(this.modsPath);

        // Liste des IDs des mods : 
        this.modsList.forEach((modID) =>
        {
            // On regarde si l'ID est valide
            if (ServerMod.isValidModID(modID))
            {
                const modPath = path.join(modsPath, modID);

                // Instanciation du mode et ajout à la liste des mods chargés
                const promise = ServerMod.instanciateFromDirectory(modPath);
                pendingPromises.push(promise);

                promise.then(modInstance =>
                {
                    modInstance.sandbox = this.sandbox;
                    this.loadedMods.add(modInstance);
                    this.emit("modLoadSuccess", modInstance);
                })
                .catch(err => this.emit("modLoadError", modID, err));
            }
            else
            {
                this.emit("modLoadError", modID, new Error("Invalid modID"));
            }
        });

        // Lorsque toutes les promesses seront terminées (succès ou échec)
        allSettled(pendingPromises).then(() => this.emit("modLoadFinish", this.loadedMods));
    }
}

module.exports = ModParser;