const LibraryComponent = require("./LibraryComponent");
const ModInterface = require("./ModInterface");

/*
    Cette classe fonctionne avec 'ModInterface'. 'ModInterfaceContainer' est un conteneur d'instances
    de 'ModInterface', c'est via l'instance globale de 'ModInterfaceContainer' que l'on va interagir avec
    les 'ModInterface' (on utilise SandboxNamespace.env.get("ModInterfaceContainer") pour récupérer cet
    objet).

    Pour interagir avec les données contenues par un 'ModInterface', on passera pas des méthodes de cette
    classe et non pas une méthode pour récupérer le 'ModInterface' directement.
*/

/* Cette classe a beaucoup de défauts, notamment au niveau de la gestion des erreurs. TODO :
    - il faudrait déclencher des exceptions en cas d'erreur
    - utiliser les évènements
    - éventuellement, avoir deux classes dinstinctes pour gérer isEnvironmentContainer ou non
    - hasSucceeded() et hasFailed() pour isEnvironmentContainer === false
 */
class ModInterfaceContainer extends LibraryComponent
{
    constructor(isEnvironmentContainer)
    {
        super();

        this.isEnvironmentContainer = isEnvironmentContainer ?? false;
        /* Si à true, alors :
            - un appel à add() va instancier le 'ModInterface' correspondant s'il ne l'est pas déjà au
            sein du conteneur
            - on peut appeler load() autant de fois que l'on veut, mais cette méthode ne devrait pas être
            utilisée dans ce cas
           Si vaut false, alors :
            - un appel à add() va aller chercher l'intance de 'ModInterface' correspondante depuis
            this.env.get("ModInterfaceContainer")
            - on ne peut appeler qu'une fois load()
        */

        this.isLoaded = false;

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
            this.modInterfaces.set(UID, this.provideModInterface(UID));
        }

        return this;
    }

    // Se comporte différemment en fonction de la valeur de this.isEnvironmentContainer
    provideModInterface(UID)
    {
        if (this.isEnvironmentContainer)
        {
            return new ModInterface(UID);
        }
        return this.env.get("ModInterfaceContainer").get(UID);
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

        return new Promise((resolve, reject) =>
        {
            if (!modInterface)
            {
                reject(`Can't access ModInterface #${UID}`);
            }
            // Si le 'ModInterface' est déjà chargé
            else if (modInterface.hasSucceeded())
            {
                resolve(key === null ? modInterface : modInterface[key]);
            }
            // Si le chargement de 'ModInterface' a échoué
            else if (modInterface.hasFailed())
            {
                reject(`Loading of #${modInterface.UID} data has failed`);
            }
            // Si le chargement de 'ModInterface' est encore en cours
            else
            {
                modInterface.on("loadSuccess", () => resolve(key === null ? modInterface : modInterface[key]));
                modInterface.on("loadError", () => reject(`Loading of #${modInterface.UID} data has failed`));
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

            promises.push(loadingPromise);
        }

        if (this.isEnvironmentContainer === false)
        {
            this.canLoad = false;
        }

        const allLoadedPromise = Promise.all(promises);

        allLoadedPromise.then(() => this.isLoaded = true)
        .catch(() => this.isLoaded = false);

        return allLoadedPromise;
    }
}

module.exports = ModInterfaceContainer;