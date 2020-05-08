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

        // Comme pour le côté client, on va stocker les mods :
        //  - classe Serveur
        //  - infos brutes : modconfig.json
        //  - infos publiques
        // ...

        this.loadedMods = new Map();
    }

    /********** Gestion des chemins **************/
    getAbsolutePath(modFolder)
    {
        // Le paramètre est modFolder et non pas UID : c'est normal car c'est seulement ici
        // qu'on parle de nom de dossier, sinon on manipule des UIDs
        return path.join(this.env.get("modPath"), modFolder);
    }

    getModconfigPath(UID)
    {
        return path.join(this.getAbsolutePath(UID), "modconfig.json");
    }

    getClientClassPath(UID)
    {
        return path.join(this.getAbsolutePath(UID), "client.js");
    }

    getServerClassPath(UID)
    {
        return path.join(this.getAbsolutePath(UID), "server.js");
    }
    /********** Fin de gestion des chemins **************/


    /********** Chargement d'un mod **************/

    /*
        Un dossier de mod doit être composé de cette manière :
        - Un fichier modinfos.json, qui décrit le mod : fichier client, fichier serveur, version, nom, etc.
        - D'autres fichiers d'extension ".js" dont le nom doit correspondre à ce qu'il y a dans modinfo.json
    */
    
    // Va charger un mod : classe client, serveur, et infos
    // Ne devrait pas être appelé directement, il faut passer par getMod(UID),
    // getClientCode(UID), getModPublicData(UID) ou getModconfig(UID)
    // Retourne une promesse, ce n'est pas ici que l'on va le stocker dans this.loadedMods
    loadMod(UID)
    {
        return new Promise((resolve, reject) =>
        {
            const UIDManager = this.env.get("UIDManager");

            this.debug("note", `Parsing ${this.getAbsolutePath(UID)} mod directory...`);

            if (UIDManager.get("mod").isValid(UID))
            {
                const mod = {}, promises = [];
                const modconfigPromise = this.loadModconfig(UID),
                      serverClassPromise = this.loadServerClass(UID);

                modconfigPromise.then(modconfig => mod.modConfig = modconfig)
                .catch(error => reject(error));

                serverClassPromise.then(serverClass => mod.serverClass = serverClass)
                .catch(error => reject(error));

                promises.push(modconfigPromise);
                promises.push(serverClassPromise);
        
                Promise.all(promises).then(() => resolve(mod))
                .catch(err => reject(err));
            }
            else
            {
                reject(new Error(`Invalid mod UID #${UID}`));
            }
        });
    }

    loadModconfig(UID)
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(this.getModconfigPath(UID), "utf8", (err, data) =>
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    const modConfig = JSON.parse(data);

                    modConfig.absolutePath = this.getAbsolutePath(UID);
                    modConfig.clientClassPath = this.getClientClassPath(UID);

                    resolve(modConfig);
                }
            });
        });
    }

    loadServerClass(UID)
    {
        // Attention !!! Ce code n'est pas asynchrone (require est synchrone)
        // Mais j'utilise quand même une promesse pour plusieurs raisons :
        // - faire tous les chargements de la même façon
        // - c'est le genre de trucs qui devrait être fait en asynchrone, donc utiliser une promesse
        // permet d'utiliser cette méthode comme-ci elle était asynchrone, comme ça à l'occaz on changera son
        // code pour la passer en asynchrone. Le mieux serait d'avoir un require asynchrone mais pas une priorité
        return new Promise((resolve, reject) =>
        {
            try
            {
                const serverClass = require(this.getServerClassPath(UID))(this.constructors.ServerMod);

                resolve(serverClass);
            }
            catch (error)
            {
                reject(error);
            }
        });
    }

    /********** Fin chargement d'un mod **************/

    /********** Récupération d'un mod depuis l'extérieur **************/

    // Retourne le mod sous forme d'une promesse, et le sauvegarde dans this.loadedMods s'il ne l'est pas déjà
    getMod(UID)
    {
        return new Promise((resolve, reject) =>
        {
            if (!this.loadedMods.has(UID))
            {
                this.loadMod(UID).then(mod => { this.loadedMods.set(UID, mod); resolve(mod); })
                .catch(err => reject(err));
            }
            else
            {
                resolve(this.loadedMods.get(UID));
            }
        });
    }

    getModconfig(UID)
    {
        return new Promise((resolve, reject) =>
        {
            this.getMod(UID).then(mod => resolve(mod.modConfig))
            .catch(error => reject(error));
        });
    }

    getModPublicData(UID)
    {
        return new Promise(async(resolve, reject) =>
        {
            try
            {
                const modConfig = await this.getModconfig(UID);

                const publicData = {
                    UID: modConfig.UID,
                    name: modConfig.name,
                    version: modConfig.version,
                    public: true
                };

                resolve(publicData);
            }
            catch (error)
            {
                reject(error);
            }
        });
    }

    // On envoie les données contenues dans le fichier en brut, car le but n'est pas de les interpréter
    getClientClass(UID)
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(this.getClientClassPath(UID), "utf8", (err, data) =>
            {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    getServerClass(UID)
    {
        return new Promise((resolve, reject) =>
        {
            this.getMod(UID).then(mod => resolve(mod.serverClass))
            .catch(error => reject(error));
        });
    }

    instanciate(UID)
    {
        return new Promise((resolve, reject) =>
        {
            this.getMod(UID).then(mod => resolve(new mod.serverClass(mod.modConfig)))
            .catch(error => reject(error));
        });
    }

    /********** Fin récupération d'un mod depuis l'extérieur **************/
}

module.exports = ModLoader;