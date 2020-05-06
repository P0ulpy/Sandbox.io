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

        this.mods.forEach(modUID =>
        {
            // url statique pour l'instant, URLManager serait pas de trop
            promises.push(modLoader.loadClassFile(modUID));
        });
    }
}

export default Sandbox;