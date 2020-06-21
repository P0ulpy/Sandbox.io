import LibraryComponent from "../LibraryComponent";
import { ModUID, getModUID, UID } from "../UID";
import ModInterface, { ModConfig } from "../ElementInterface/ModInterface";

import env from "../Environment";
import { ModsCollection } from "../Mod";
import ModServer from "../Mod";
import { ModInterfaceDependencies } from "../ElementInterface";

/*
    Cette classe fonctionne avec 'ModInterface'. 'ModInterfaceContainer' est un conteneur d'instances
    de 'ModInterface', c'est via l'instance globale de 'ModInterfaceContainer' que l'on va interagir avec
    les 'ModInterface' (on utilise SandboxNamespace.env.ModInterfaceContainer pour récupérer cet
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
export default class ModInterfaceContainer extends LibraryComponent
{
    public isEnvironmentContainer: boolean;
    public isLoaded: boolean = false;
    public modInterfaces: Map<ModUID, ModInterface> = new Map<ModUID, ModInterface>();
    public canLoad: boolean | null = null;

    constructor(isEnvironmentContainer?: boolean)
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
            this.env.ModInterfaceContainer
            - on ne peut appeler qu'une fois load()
        */
    }

    /* Accesseurs à ne pas utiliser en dehors de la classe */

    has(UID: ModUID): boolean
    {
        return this.modInterfaces.has(UID);
    }

    add(UID: ModUID): ModInterfaceContainer
    {
        if (!this.has(UID))
        {
            const modInterface = this.provideModInterface(UID);

            if (modInterface)
            {
                this.modInterfaces.set(UID, modInterface);
            }
            else
            {
                console.log("Attention !!!");
            }
        }

        return this;
    }

    // Se comporte différemment en fonction de la valeur de this.isEnvironmentContainer
    provideModInterface(UID: ModUID): ModInterface | void
    {
        if (this.isEnvironmentContainer)
        {
            return new ModInterface(UID);
        }
        return env.ModInterfaceContainer.get(UID);
    }

    get(UID: ModUID): ModInterface | void
    {
        this.add(UID);

        return this.modInterfaces.get(UID);
    }

    /* Accéder à un 'ModInterface' et à ses données de manière asynchrone */

    /* Retourne une promesse qui sera résolue ou non en fonction du succès ou non du chargement de l'instance
    de 'ModInterface' demandée */
    accessModInterface(UID: ModUID): Promise<ModInterface>
    {
        const modInterface = this.get(UID);

        return new Promise<ModInterface>((resolve, reject) =>
        {
            if (!modInterface)
            {
                reject(`Can't access ModInterface #${UID}`);
            }
            // Si le 'ModInterface' est déjà chargé
            else if (modInterface.hasSucceeded())
            {
                resolve(modInterface);
            }
            // Si le chargement de 'ModInterface' a échoué
            else if (modInterface.hasFailed())
            {
                reject(`Loading of #${modInterface.UID} data has failed`);
            }
            // Si le chargement de 'ModInterface' est encore en cours
            else
            {
                modInterface.on("loadSuccess", () => resolve(modInterface));
                modInterface.on("loadError", () => reject(`Loading of #${modInterface.UID} data has failed`));
            }
        });
    }

    getModInterface(UID: ModUID)
    {
        return this.accessModInterface(UID);
    }

    getModconfig(UID: ModUID): Promise<ModConfig>
    {
        return new Promise<ModConfig>((resolve, reject) => {

            const modInterfacePromise = this.accessModInterface(UID);

            modInterfacePromise.then((modInterface) => resolve(modInterface.modConfig as ModConfig))
            .catch(err => reject(err));
        });
    }

    getServerClass(UID: ModUID): Promise<FunctionConstructor>
    {
        return new Promise<FunctionConstructor>((resolve, reject) => {

            const modInterfacePromise = this.accessModInterface(UID);

            modInterfacePromise.then((modInterface) => resolve(modInterface.serverClass as FunctionConstructor))
            .catch(err => reject(err));
        });
    }

    /* Permet d'ajouter plusieurs 'ModInterface' au conteneur en même temps, et retourne une promesse qui est résolue si
    le chargement de tous les 'ModInterface' en question s'est terminé avec succès, ou est rejetée à la moindre erreur de
    chargement */
    load(UIDs: ModUID[])
    {
        if (this.canLoad === false)
        {
            throw new Error("Can't call load() multiple times on non-environment ModInterfaceContainer instance");
        }

        const promises: Array<Promise<ModInterface>> = new Array<Promise<ModInterface>>();

        for (const UID of UIDs)
        {
            this.add(UID);

            const modInterface = this.get(UID);

            if (modInterface)
            {
                promises.push(modInterface.loadingPromise);
            }
            else
            {
                console.log("Attention, impossible d'ajouter la promesse");
            }
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

    instanciate(): Promise<ModsCollection>
    {
        // @TODO pas ouf, faudrait avoir GlobalModInterfaceContainer et ModInterfaceContainer
        const mods: ModsCollection = new ModsCollection();
        // Si plusieurs mods ont la même dépendance, alors on ne l'instancie pas plusieurs fois
        const deps: Map<ModUID, ModServer> = new Map<ModUID, ModServer>();

        return new Promise<ModsCollection>((resolve, reject) => {

            for (const [ UID, modInterface ] of this.modInterfaces.entries())
            {
                modInterface.dependencies.dependencies
            }

        });
    }

    // @TODO pas ouf et pas opti mais fonctionne
    private instanciateRecursiveDeps(): Promise<Map<ModUID, ModServer>>
    {
        const deps: Map<ModUID, ModServer> = new Map<ModUID, ModServer>();

        function i(modInterfaceDependencies: ModInterfaceDependencies)
        {
            for (const [ UID, modInterface ] of modInterfaceDependencies.dependencies.entries())
            {

            }
        }

        // Pour chaque modinterface du conteneur : this.modInterfaces
        // On récupère ses dépendances.

        for (const [ UID, modInterface ] of this.modInterfaces.entries())
        {

        }

        return new Promise<Map<ModUID, ModServer>>((resolve, reject) => {

        });
    }
}