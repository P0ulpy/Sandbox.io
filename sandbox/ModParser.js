const ServerMod = require("./ServerMod");
const path = require("path");
// Pollyfill de Promise.allSettled() qui n'est pas encore disponible sur Node.JS
const allSettled = require("promise.allsettled");
const EventEmitter = require("events").EventEmitter;

class ModsCollection
{
    constructor()
    {
        this.mods = new Map();
    }

    //Object.defineProperty(this, "length", { get: () => this.mods.size });
    get length()
    {
        return this.mods.size;
    }

    add(mod)
    {
        this.mods.set(mod.uniqueID, mod);
    }

    forEach(callback)
    {
        this.mods.forEach((mod, uniqueID) =>
        {
            callback(mod, uniqueID);
        });
    }

    to(...targetsIDs)
    {
        const filteredCollection = new ModsCollection();

        this.mods.forEach((mod, uniqueID) =>
        {
            if (targetsIDs.includes(uniqueID))
            {
                filteredCollection.add(mod);
            }
        });

        return filteredCollection;
    }

    emit(event, data)
    {
        this.mods.forEach((mod) =>
        {
            mod.emit(event, data);
        });
    }
}


class ModParser extends EventEmitter
{
    constructor(sandbox, modsList, modsPath = "./sandbox/Mods")
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