// SALE, temporaire, trouver meilleure façon
import SandboxNamespace from "./../../assets/js/SandboxNamespace.js";

// Ce fichier sera directement envoyé au client et pas interprété par le serveur
// ClientMod provient de sandbox.client.js
class Mod001 extends SandboxNamespace.constructors.ClientMod
{
    constructor()
    {
        super();
        console.log("Mod001 instancié !!!!");
    }
}

export default Mod001;


// Mods natifs : NativeItemMod
// NativePlayerMod
// NativeEnvironmentMod
// NativeGameObjectMod


// Code côté client (fichier envoyé au client)
/*
const myMod1 = new ModClient();     // /!\ new Sandbox.Mod() et non pas Sandbox.Mod.Client()
// On passe le this = instance sandbox client
myMod1.onReceiveData(event, callback(data));
myMod1.sendData(event, data, ack);
*/