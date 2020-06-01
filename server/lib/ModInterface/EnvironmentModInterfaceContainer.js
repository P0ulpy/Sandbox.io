const LibraryComponent = require("../LibraryComponent");
const ModInterface = require("../ModInterface");


class EnvironmentModInterfaceContainer extends LibraryComponent
{
    constructor()
    {
        super();

        this.modInterfaces = new Map();
    }

    /* Accesseurs à ne pas utiliser en dehors de la classe */

    has(UID)
    {
        return this.modInterfaces.has(UID);
    }

    add(UID)
    {
        if (!this.has(UID))
        {
            this.modInterfaces.set(UID, new ModInterface(UID));
        }

        return this;
    }

    get(UID)
    {
        this.add(UID);

        return this.modInterfaces.get(UID);
    }

    /* Accéder à un 'ModInterface' et à ses données de manière synchrone : on ne se préoccupe pas si l'instance
    de 'ModInterface' est chargée ou non. */
    accessSyncModInterface(UID, key = null)
    {
        const modInterface = this.get(UID);

        if (modInterface)
        {
            return (key === null ? modInterface : modInterface[key]);
        }
        return null;
    }

    getSyncModInterface(UID)
    {
        return this.accessSyncModInterface(UID);
    }

    getSyncModconfig(UID)
    {
        return this.accessSyncModInterface(UID, "modConfig");
    }

    getSyncServerClass(UID)
    {
        return this.accessSyncModInterface(UID, "serverClass");
    }

    /* Accéder à un 'ModInterface' et à ses données de manière asynchrone */

    /* Retourne une promesse qui sera résolue ou non en fonction du succès ou non du chargement de l'instance
    de 'ModInterface' demandée */
    accessModInterface(UID, key = null)
    {
        const modInterface = this.get(UID);

        return new Promise((resolve, reject) => {
            if (!modInterface)
            {
                reject(`Can't access ModInterface #${UID}`);
            }
            else
            {
                const loadingPromise = modInterface.loadingPromise;

                loadingPromise.then(() => resolve(modInterface))
                .catch(() => reject(modInterface));
            }
        });
    }

    getModInterface(UID)
    {
        return this.accessModInterface(UID);
    }

    getModconfig(UID)
    {
        return this.accessModInterface(UID, "modConfig");
    }

    getServerClass(UID)
    {
        return this.accessModInterface(UID, "serverClass");
    }
}

module.exports = EnvironmentModInterfaceContainer;