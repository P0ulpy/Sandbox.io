const LibraryComponent = require("./LibraryComponent");

class ServerMod extends LibraryComponent
{
    constructor(config = {})
    {
        super();

        this.debug("note", `${this.constructor.name} instancié`);

        // Pas obligatoire : warning
        this.name = config.name || "default";

        // Pas obligatoire : warning
        this.version = config.version || "0.0.0";

        // Obligatoire : erreur
        this.UID = config.UID;

        // Obligatoire : erreur
        this.sandbox = config.sandbox;

        // Chemin absolu du Mod sur le serveur : erreur
        this.modPath = config.absolutePath;

        // Propriétés ajoutées au mod par le développeur
        this.customProperties = new Map();
    }

    set(key, value)
    {
        this.customProperties.set(key, value);
    }

    get()
    {
        return this.customProperties.get(key);
    }
}

module.exports = ServerMod;