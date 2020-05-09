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
class ModInterfaceContainer extends LibraryComponent
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
        if (!this.has(UID))
        {
            this.add(UID);
        }

        return this.modInterfaces.get(UID);
    }

    /* Méthodes synchones pour interagir avec les données des 'ModInterface' */

    getSyncModInterfaceData(UID, key)
    {
        const modInterface = this.get(UID);

        return (modInterface.hasSucceeded() ? modInterface[key] : null);
    }

    getSyncModconfig(UID)
    {
        return this.getSyncModInterfaceData(UID, "modConfig");
    }

    getSyncServerClass(UID)
    {
        return this.getSyncModInterfaceData(UID, "serverClass");
    }

    /* Méthodes asynchones pour interagir avec les données des 'ModInterface' */

    getModInterfaceData(UID, key)
    {
        const modInterface = this.get(UID);

        return new Promise((resolve, reject) =>
        {
            // Si le 'ModInterface' est déjà chargé
            if (modInterface.hasSucceeded())
            {
                resolve(modInterface[key]);
            }
            // Si le chargement de 'ModInterface' a échoué
            else if (modInterface.hasFailed())
            {
                reject(`Loading of ${modInterface.UID} data has failed`);
            }
            // Si le chargement de 'ModInterface' est encore en cours
            else
            {
                modInterface.on("loadSuccess", () => resolve(modInterface[key]));
                modInterface.on("loadError", () => reject(`Loading of ${modInterface.UID} data has failed`));
            }
        });
    }

    getModconfig(UID)
    {
        return this.getModInterfaceData(UID, "modConfig");
    }

    getServerClass(UID)
    {
        return this.getModInterfaceData(UID, "serverClass");
    }
}

module.exports = ModInterfaceContainer;