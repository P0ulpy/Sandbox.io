import SandboxNamespace from "./SandboxNamespace.js";
import ClientMod from "./ClientMod.js";

class ModLoader
{
    constructor()
    {
        this.loadedModClasses = new Map();
    }

    hasLoaded(UID)
    {
        return this.loadedModClasses.has(UID);
    }

    async fetchModClass(UID)
    {
        return new Promise(async(resolve, reject) =>
        {
            const URLManager = SandboxNamespace.env.get("URLManager");
            const modClassURL = URLManager.computeAsString("getModClass", { UID: UID });
    
            try
            {
                // Car export default Mod${UID}
                const modClass = (await import(modClassURL)).default(ClientMod);
                
                // On fait hériter cette classe de ClientMod()
                // En fait non, pas obligatoire pour l'instant
                //modClass.prototype = Object.create(ClientMod.prototype);
                //modClass.prototype.constructor = ClientMod;

                this.loadedModClasses.set(UID, modClass);
                resolve(modClass);
            }
            catch (error)
            {
                reject(error);
            }
        });
    }

    // Depuis l'extérieur il faut utiliser cette méthode, elle se chargera de charger la classe si ça n'a pas encore
    // été fait, puis elle la retourne sous forme d'une promesse
    getModClass(UID)
    {
        return new Promise((resolve, reject) =>
        {
            if (!this.hasLoaded(UID))
            {
                this.fetchModClass(UID).then(modClass => resolve(modClass))
                .catch(error => reject(error));
            }
            else
            {
                resolve(this.loadedModClasses.get(UID));
            }
        });
    }
}

export default ModLoader;