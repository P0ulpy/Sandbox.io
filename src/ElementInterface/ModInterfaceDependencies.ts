import LibraryComponent from "../LibraryComponent";
import ModInterface, { ModConfig } from "./ModInterface";

import env from "../Environment";
import ModInterfaceContainer from "../Containers/ModInterfaceContainer";
import { ModUID } from "../UID";

/*
    Un objet 'ModInterfaceDependencies' va gérer les dépendances d'un 'ModInterface', en se
    basant sur l'instance globale de 'ModInterfaceContainer'.
    Si un objet 'ModInterface' dépend d'un 'ModInterface' qui dépend également de lui, alors
    il y aura des appels récursifs infinis. En principe, la dépendance ne peut aller que dans
    un sens, sinon elle n'a aucun sens (un peu comme un héritage).
    Il faudra trouver un moyen de s'assurer qu'il n'y ait pas ce type de dépendance réciproque.

    Cette classe permet de gérer les chargement des dépendances, et donc les éventuelles erreurs
    qui vont avec plutôt que d'encombrer le 'ModInterface' en lui-même.

    Dès l'instanciation du 'ModInterface', ce constructeur sera appelé mais il faudra attendre que
    le 'ModInterface' ait chargé ses données "modConfig" qui contient les dépendances à charger
    pour que 'MotInterfaceDependencies' commence le chargement des dépendances.
    Des évènements seront émis selon l'évolution du chargement des dépendances.
*/
export default class ModInterfaceDependencies extends LibraryComponent
{
    public modInterface: ModInterface;
    // Dépendances à charger
    // @TODO pas ouf cette notation, trouver un truc mieux
    public toLoad: ModUID[] | null = null;
    // Dépendances chargées ou en cours de chargement : instances de 'ModInterface'
    public dependencies: Map<string, ModInterface> = new Map<string, ModInterface>();

    constructor(modInterface: ModInterface)
    {
        super();

        this.modInterface = modInterface;

        /* Lorsque l'objet 'ModInterface' parent a chargé sa configuration, donc qu'il
        connaît ses dépendances, on commence à les charger */
        this.modInterface.on("modconfigLoadSuccess", () => this.loadDependencies());
    }

    get size(): number
    {
        return this.dependencies.size;
    }

    hasAllLoaded(): boolean
    {
        return ((this.toLoad as ModUID[]).length === this.dependencies.size);
    }

    setDependency(modInterface: ModInterface): void
    {
        this.dependencies.set(modInterface.UID.value, modInterface);
        this.modInterface.emit("loadDependencySuccess", modInterface);

        if (this.hasAllLoaded())
        {
            this.modInterface.emit("loadAllDependencies");
        }
    }

    loadDependencies(): void
    {
        const modInterfaceContainer: ModInterfaceContainer = env.ModInterfaceContainer;
        this.toLoad = (this.modInterface.modConfig as ModConfig).dependencies;

        if (!this.toLoad)
        {
            this.debug("error", `Attention, toLoad vaut : ${this.toLoad}`)
        }

        this.debug("note", `Loading ${this.toLoad?.length} dependencies for Mod #${this.modInterface.UID}`);

        /* Pas besoin d'émettre l'évènement "loadAllDependencies" s'il n'y a aucune dépendance, puisque la vérification sera effectuée
        dans 'ModInterface' via hasAllLoaded() */
        for (const dep of this.toLoad)
        {
            const dependencyPromise = modInterfaceContainer.getModInterface(dep);

            dependencyPromise.then(modInterface => this.setDependency(modInterface))
            .catch(err => this.modInterface.emit("loadDependencyError", dep, err));
        }
    }
}