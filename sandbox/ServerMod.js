const path = require("path");
const fs = require("fs");
const EventEmitter = require("events").EventEmitter;

class ServerMod extends EventEmitter
{
    constructor(config = {})
    {
        super();

        // Pas obligatoire : warning
        this.name = config.name || "default";

        // Pas obligatoire : warning
        this.version = config.version || "0.0.0";

        // Obligatoire : erreur
        this.uniqueID = config.uniqueID;

        // Obligatoire : erreur
        this.sandbox = config.sandbox;

        // Chemin absolu du Mod sur le serveur : erreur
        this.modPath = config.modPath;

        // Pas obligatoire : warning (mod uniquement serveur par exemple)
        // Seulement 1 fichier client supporté pour le moment
        this.clientFile = path.join(config.modPath, config.client);

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

    static isValidModID(modID)
    {
        // ID : chaîne de caractère qui représente un nombre allant de 000 à 999
        return /^[0-9]{3}$/.test(modID);
    }

    /*
        Un dossier de mod doit être composé de cette manière :
        - Un fichier modinfos.json, qui décrit le mod : fichier client, fichier serveur, version, nom, etc.
        - D'autres fichiers d'extension ".js" dont le nom doit correspondre à ce qu'il y a dans modinfo.json
    */
    static instanciateFromDirectory(modPath)
    {
        return new Promise((resolve, reject) =>
        {
            console.log(`[+] Parsing ${modPath} mod directory...`);
            const modConfigPath = path.join(modPath, "modconfig.json");

            /*
                Toutes les opérations I/O doivent être asynchrones pour des raisons de performances.
                Il faut donc utiliser des fonctions asynchrones chaque fois que possible.
            */
            fs.readFile(modConfigPath, "utf-8", (err, data) =>
            {
                if (err) reject(err);
                else
                {
                    const modConfig = JSON.parse(data);
                    const serverModFile = path.join(modPath, modConfig.server || "server");

                    modConfig.modPath = modPath;

                    resolve(new (require(serverModFile))(modConfig));
                }
            });
        });
    }
}

module.exports = ServerMod;