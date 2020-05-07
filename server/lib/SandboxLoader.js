const fs = require("fs");
const path = require("path");
const allSettled = require("promise.allsettled");
const LibraryComponent = require("./LibraryComponent");

class SandboxLoader extends LibraryComponent
{
    constructor()
    {
        super();
    }

    getAbsolutePath(sandboxFolder)
    {
        return path.join(this.env.get("sandboxPath"), sandboxFolder);
    }

    getSandboxConfigPath(sandboxFolder)
    {
        const absolutePath = this.getAbsolutePath(sandboxFolder);
        return path.join(absolutePath, "sandboxconfig.json");
    }

    getSandboxConfigData(sandboxFolder)
    {
        return new Promise((resolve, reject) =>
        {
            fs.readFile(this.getSandboxConfigPath(sandboxFolder), "utf8", (err, data) =>
            {
                if (err) reject(err);
                else resolve(JSON.parse(data));
            });
        });
    }

    getPublicInfos(sandboxFolder)
    {
        return new Promise(async(resolve, reject) =>
        {
            try
            {
                // Code OK mais pas maintenable. Pour l'instant faut se contenter d'un truc qui marche
                // mais si on veut faire ça bien faudra réorganiser la partie chargement et récupération
                // des données relatives aux mods et sandboxes
                const modLoader = this.env.get("ModLoader");
                const sandboxConfigData = await this.getSandboxConfigData(sandboxFolder);
                const mods = {}, modsPromise = [];

                for (const modUID of sandboxConfigData.mods)
                {
                    const modPromise = modLoader.getModPublicInfos(modUID);
                    modsPromise.push(modPromise);

                    modPromise.then((data) => { mods[modUID] = data })
                    .catch(err => this.debug("error", err.message));
                }

                // Vachement pratique le await !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // ici 0 risque de Promise.reject()
                await allSettled(modsPromise);

                const publicData = {
                    name: sandboxConfigData.name,
                    MOTD: sandboxConfigData.MOTD,
                    mods: mods,
                    size: sandboxConfigData.size,
                    //password: ..., isStarted: ..., playersCount: ...
                }

                resolve(publicData);
            }
            catch (error)
            {
                reject(error);
            }
        });
    }
}

module.exports = SandboxLoader;