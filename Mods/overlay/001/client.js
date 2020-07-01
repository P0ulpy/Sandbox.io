// Ce fichier sera directement envoyé au client et pas interprété par le serveur
// ClientMod provient de sandbox.client.js

// Pas ouf mais marche, comme ça on contrôle bien le ClientMod passé (côté client)
export default (ClientMod) =>
{
    return class Mod001 extends ClientMod
    {
        constructor(config)
        {
            super(config);

            this.canvas = document.getElementById("overlayCanvas");
            this.context = this.canvas.getContext("2d");

            this.init();
        }

        onReceiveData(event, data)
        {
            console.log(`[Overlay] : ${event}`, data);
        }

        init()
        {
            console.log("Mod001 instancié !");

            document.addEventListener("keydown", (event) =>
            {
                if (event.key === "Escape")
                {
                    const elt = document.getElementById("overlayDiv");

                    elt.style.display = (elt.style.display === "block" ? "none" : "block");
                }
            });
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