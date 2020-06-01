const LibraryComponent = require("../LibraryComponent");
const ModInterface = require("../ModInterface");

/*
    Cette classe fonctionne avec 'ModInterface'. 'ModInterfaceContainer' est un conteneur d'instances
    de 'ModInterface', c'est via l'instance globale de 'ModInterfaceContainer' que l'on va interagir avec
    les 'ModInterface' (on utilise SandboxNamespace.env.get("ModInterfaceContainer") pour récupérer cet
    objet).

    Pour interagir avec les données contenues par un 'ModInterface', on passera pas des méthodes de cette
    classe et non pas une méthode pour récupérer le 'ModInterface' directement.
*/

class ModInterfaceContainer extends LibraryComponent
{
    constructor()
    {
        super();

        this.modInterfaces = new Map();

        this.changeStatus(ModInterfaceContainer.LOADING_PROGRESS);
    }

    /* Gestion des évènements */

    isStatusValid(status)
    {
        return (status === ModInterfaceContainer.LOADING_PROGRESS ||
                status === ModInterfaceContainer.LOADING_SUCCESS ||
                status === ModInterfaceContainer.LOADING_ERROR);
    }

    changeStatus(newStatus)
    {
        if (!this.isStatusValid(newStatus))
        {
            throw new Error(`Invalid status ${newStatus}`);
        }

        this.emit("statusChange", newStatus);
        this.status = newStatus;
    }

    /* Gestion du statut */

    hasSucceeded()
    {
        return (this.status === ModInterfaceContainer.LOADING_SUCCESS);
    }

    hasFailed()
    {
        return (this.status === ModInterfaceContainer.LOADING_ERROR);
    }

    isFinished()
    {
        return (this.hasSucceeded() || this.hasFailed());
    }

    /* Accesseurs à ne pas utiliser en dehors de la classe */

    has(UID)
    {
        return this.modInterfaces.has(UID);
    }

    add(UID)
    {
        const environmentContainer = this.env.get("ModInterfaceContainer");

        if (!this.has(UID))
        {
            this.modInterfaces.set(UID, environmentContainer.get(UID));
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

    /* Permet d'ajouter plusieurs 'ModInterface' au conteneur en même temps, et retourne une promesse qui est résolue si
    le chargement de tous les 'ModInterface' en question s'est terminé avec succès, ou est rejetée à la moindre erreur de
    chargement */
    load(UIDs)
    {
        if (this.canLoad === false)
        {
            throw new Error("Can't call load() multiple times on non-environment ModInterfaceContainer instance");
        }

        const promises = [];

        for (const UID of UIDs)
        {
            this.add(UID);

            const modInterface = this.get(UID);
            const loadingPromise = modInterface.loadingPromise;

            loadingPromise.then(() => this.emit("modInterfaceLoaded", modInterface))
            .catch(() => this.emit("modInterfaceError", modInterface));

            promises.push(loadingPromise);
        }

        if (this.isEnvironmentContainer === false)
        {
            this.canLoad = false;
        }

        const allLoadedPromise = Promise.all(promises);

        allLoadedPromise.then(() => this.emit("loadingSuccess"))
        .catch(() => this.emit("loadingError"));

        return allLoadedPromise;
    }
}

ModInterfaceContainer.LOADING_PROGRESS = Symbol("Chargement des ModInterface du conteneur en cours...");
ModInterfaceContainer.LOADING_SUCCESS = Symbol("Tous les ModInterface du conteneur ont été chargés avec succès");
ModInterfaceContainer.LOADING_ERROR = Symbol("Erreur de chargement d'au moins un ModInterface du conteneur");

module.exports = ModInterfaceContainer;