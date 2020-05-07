import SandboxNamespace from "./SandboxNamespace.js";
import EventEmitter from "./vendors/EventEmitter.js";

class Sandbox extends EventEmitter
{
    // On lui passe juste l'UID et elle va contacter le serveur et faire le boulot
    // toute seule comme une grande et va émettre des évènements au fur et à mesure
    // jusqu'à ce qu'elle soit chargée
    constructor(UID)
    {
        super();
        const ajaxManager = SandboxNamespace.env.get("AjaxManager");

        // Gérer avec objet spécifique plus tard
        this.modsInstances = new Map();

        ajaxManager.execute("getSandboxInfos", { UID: UID })
        .then((infos) =>
        {
            infos = JSON.parse(infos);
            this.emit("infosLoaded");

            for (const key in infos)
            {
                this[key] = infos[key];
            }

            this.loadMods();
        })
        .catch(console.log);
    }

    loadMods()
    {
        const modLoader = SandboxNamespace.env.get("ModLoader");
        const promises = [];
        this.emit("modLoadStart");

        for (const mod of Object.values(this.mods))
        {
            // Chargement du fichier de la classe client correspondant au mod
            // URL statique, pas ouf, mais pas le temps de faire mieux
            const classModPromise = modLoader.getModClass(mod.UID);

            classModPromise.then(modClass => this.modsInstances.set(mod.UID, new modClass()));

            promises.push(classModPromise);
        }
    }
}

export default Sandbox;