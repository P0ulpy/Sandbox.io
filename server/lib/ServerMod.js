const path = require("path");
const fs = require("fs");
const LibraryComponent = require("./LibraryComponent");

class ServerMod extends LibraryComponent
{
    constructor(config = {})
    {
        super();

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

        // Pas obligatoire : warning (mod uniquement serveur par exemple)
        // Seulement 1 fichier client supporté pour le moment
        this.clientFile = path.join(config.absolutePath, config.client);

        // Propriétés ajoutées au mod par le développeur
        this.customProperties = new Map();
    }

    getClientCode()
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(this.clientFile, "utf8", (err, data) =>
            {
                if (err) reject(err);
                else resolve(data);
            });
        });
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