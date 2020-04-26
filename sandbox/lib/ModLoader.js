const path = require("path");
const fs = require("fs");
const LibraryComponent = require("./LibraryComponent");

// Cette classe s'intéresse à la façon dont un mod est chargé. Elle est différente de ModParser
// car ModParser s'appuie sur cette classe pour charger une liste de Mods et gérer leurs dépendances
// mais ModParser et ModsCollection risquent de changer à l'avenir (voire d'être supprimées)
// Mais ModLoader restera là pour gérer les différentes façons éventuelles de charger un mod et
// de s'assurer de leur validité avant d'être ajoutés à une instance de ModsCollection
class ModLoader extends LibraryComponent
{
    constructor()
    {
        super();
    }

    getAbsolutePath(modFolder)
    {
        return path.join(this.globals.get("modPath"), modFolder);
    }

    /*
        Un dossier de mod doit être composé de cette manière :
        - Un fichier modinfos.json, qui décrit le mod : fichier client, fichier serveur, version, nom, etc.
        - D'autres fichiers d'extension ".js" dont le nom doit correspondre à ce qu'il y a dans modinfo.json
    */
    instanciateFromFolder(modFolder)
    {
        const absolutePath = this.getAbsolutePath(modFolder);

        return new Promise((resolve, reject) =>
        {
            this.debug("note", `Parsing ${absolutePath} mod directory...`)
            const modConfigPath = path.join(absolutePath, "modconfig.json");

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
                    const serverModFile = path.join(absolutePath, modConfig.server);

                    if (this.globals.get("UIDManager").get("mod").isValid(modConfig.uniqueID))
                    {
                        modConfig.absolutePath = absolutePath;

                        resolve(new (require(serverModFile))(modConfig));
                    }
                    else reject(new Error("Invalid modID"));
                }
            });
        });
    }
}

module.exports = ModLoader;