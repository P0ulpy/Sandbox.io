const LibraryComponent = require("./LibraryComponent");
const ModInterface = require("./ModInterface");

/*
    Un objet 'ModServer' désigne une instance d'un mod, qui peut être intégrée dans une Sandbox. Il est crée à partir d'un
    objet 'ModInterface' qui contient les données statiques nécessaires à l'instanciation d'un 'ModServer' (sa classe notamment).

    L'objet 'ModInterface' correspond à la représentation du 'ModServer' stocké en dur (ici, dans le dossier "Mods"), alors qu'un
    objet 'ModServer' est la version utilisable de ce mod, qui sera manipulé par la Sandbox. Tous les mods crées à partir d'un même
    objet 'ModInterface' auront le même comportement, mais ils resteront indépendants : leurs données communes seront accessibles via
    la propriété modInterface qui stocke la référence vers l'objet 'ModInterface' duquel ils proviennent, mais chacun de ces mods
    pourra ensuite avoir son propre contexte (ses propres propriétés personnalisées, etc.).
*/

class ModServer extends LibraryComponent
{
    constructor(modInterface, sandbox)
    {
        super();

        // Ne marche pas pour une raison inconnue
        /*if (!(modInterface instanceof ModInterface))
        {
            throw new Error("modInterface param to ModServer constructor must be an instance of ModInterface");
        }
        else */if (!modInterface.hasSucceeded())
        {
            throw new Error("Can't instanciate a ModServer which ModInterface isn't loaded");
        }
        this.modInterface = modInterface;

        // Faire pareil avec Sandbox...
        this.sandbox = sandbox;

        this.debug("note", `Mod #${this.constructor.name} instancié`);

        // Un 'ModServer' stocke ses dépendances sous forme d'instances de 'ModServer' dont la clé est l'UID
        this.dependencies = new Map();

        // Propriétés ajoutées au mod par le développeur
        this.customProperties = new Map();

        this.loadDependencies();
    }

    set(key, value)
    {
        this.customProperties.set(key, value);
    }

    get()
    {
        return this.customProperties.get(key);
    }

    /* Une instance de 'ModServer' n'est créée que lorsque son 'ModInterface' correspondant l'est, donc que les
    dépendances sont prêtes à être instanciées */
    loadDependencies()
    {
        const dependenciesToInstanciate = this.modInterface.dependencies.dependencies;

        for (const [ UID, modInterface ] of dependenciesToInstanciate.entries())
        {
            this.dependencies.set(UID, new modInterface.serverClass(modInterface, this.sandbox));
        }
    }
}

module.exports = ModServer;