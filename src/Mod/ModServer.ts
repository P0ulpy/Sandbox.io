import LibraryComponent from "../LibraryComponent";
import ModInterface from "../ElementInterface/ModInterface";
import { ModUID } from "../UID";
import Sandbox from "../Sandbox";

/*
    Un objet 'ModServer' désigne une instance d'un mod, qui peut être intégrée dans une Sandbox. Il est crée à partir d'un
    objet 'ModInterface' qui contient les données statiques nécessaires à l'instanciation d'un 'ModServer' (sa classe notamment).

    L'objet 'ModInterface' correspond à la représentation du 'ModServer' stocké en dur (ici, dans le dossier "Mods"), alors qu'un
    objet 'ModServer' est la version utilisable de ce mod, qui sera manipulé par la Sandbox. Tous les mods crées à partir d'un même
    objet 'ModInterface' auront le même comportement, mais ils resteront indépendants : leurs données communes seront accessibles via
    la propriété modInterface qui stocke la référence vers l'objet 'ModInterface' duquel ils proviennent, mais chacun de ces mods
    pourra ensuite avoir son propre contexte (ses propres propriétés personnalisées, etc.).
*/

export default class ModServer extends LibraryComponent
{
    public UID: ModUID;
    public modInterface: ModInterface;
    public sandbox: Sandbox;
    public dependencies: Map<string, ModServer> = new Map<string, ModServer>();

    constructor(modInterface: ModInterface, sandbox: Sandbox)
    {
        super();

        if (!modInterface.hasSucceeded())
        {
            throw new Error("Can't instanciate a ModServer which ModInterface isn't loaded");
        }

        this.UID = modInterface.UID;

        this.modInterface = modInterface;

        // Faire pareil avec Sandbox...
        this.sandbox = sandbox;

        this.debug("note", `Mod #${this.constructor.name} instancié`);

        // Un 'ModServer' stocke ses dépendances sous forme d'instances de 'ModServer' dont la clé est l'UID
        this.dependencies = new Map();

        this.loadDependencies();
    }

    /* Une instance de 'ModServer' n'est créée que lorsque son 'ModInterface' correspondant l'est, donc que les
    dépendances sont prêtes à être instanciées */
    loadDependencies(): void
    {
        const dependenciesToInstanciate = this.modInterface.dependencies.dependencies;
        // @TODO revoir le systeme d'instanciation : classe typescript dans le dossier src ?
        for (const [ UID, modInterface ] of dependenciesToInstanciate.entries())
        {
            // @TODO gerer instanciation mieux que ça, et eventuellement écrire classes en TS et le compiler ?
            const modServerClass = new (modInterface.serverClass as any)(modInterface, this.sandbox);
            this.dependencies.set(UID, modServerClass);
        }
    }
}