// Ce fichier sera directement envoyé au client et pas interprété par le serveur
// ClientMod provient de sandbox.client.js

// L'héritage est géré dynamiquement côté client :
export default (ClientMod) =>
{
    return class Mod001 extends ClientMod
    {
        constructor()
        {
            super();

            this.init();
        }

        init()
        {
            console.log("Mod002 instancié !");
        }
    }
}


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