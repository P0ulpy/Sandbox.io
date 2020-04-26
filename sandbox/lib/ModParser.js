const path = require("path");
// Pollyfill de Promise.allSettled() qui n'est pas encore disponible sur Node.JS
const allSettled = require("promise.allsettled");
const ModsCollection = require("./ModsCollection");
const LibraryComponent = require("./LibraryComponent");

/*
    Le ModParser va chercher les informations depuis l'instance de Sandbox :
    - mods à instancier
    - instance de ModsCollection

    Pour chaque mod à instancier, le ModParser va vérifier si l'ID est valide,
    puis il passe la main à l'instance de ModsCollection qui va instancier chaque mod
    indépendemment. Le ModParser doit regarder par exemple si 
*/
class ModParser extends LibraryComponent
{
    constructor(sandbox)
    {
        super();

        this.sandbox = sandbox;

        this.loadedMods = new ModsCollection();

        // Suppression des doublons
        this.mods = Array.from(new Set(this.sandbox.mods));
    }

    parse()
    {
        // Liste de toutes les promesses de instanciateMod()
        const pendingPromises = [];

        // Liste des chemins des Mods : il faut bien comprendre que le nom du dossier est différent
        // de l'UID du mode, même si dans notre cas ils ont la même valeur
        // Le "vrai" UID du mode est contenu dans modconfig.json
        this.mods.forEach(modFolder =>
        {
            // Instanciation du mode et ajout à la liste des mods chargés
            const promise = this.globals.get("modLoader").instanciateFromFolder(modFolder);
            pendingPromises.push(promise);

            promise.then(modInstance =>
            {
                modInstance.sandbox = this.sandbox;
                this.loadedMods.add(modInstance);
                this.emit("modLoadSuccess", modInstance);
            })
            .catch(err => this.emit("modLoadError", modFolder, err));
        });

        // Lorsque toutes les promesses seront terminées (succès ou échec)
        allSettled(pendingPromises).then(() => this.emit("modLoadFinish", this.loadedMods));
    }
}

module.exports = ModParser;