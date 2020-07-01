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

            this.canvas = document.getElementById("gameplayCanvas");
            this.context = this.canvas.getContext("2d");

            this.init();
        }

        onKeyDown(event)
        {
            if (event.key === "ArrowRight")
            {
                this.sendData("move", "right");
            }
            else if (event.key === "ArrowLeft")
            {
                this.sendData("move", "left");
            }
            else if (event.key === "ArrowUp")
            {
                this.sendData("move", "up");
            }
            else if (event.key === "ArrowDown")
            {
                this.sendData("move", "down");
            }
        }

        onReceiveData(event, data)
        {
            if (event === "update")
            {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                //{ position: player.position, sprite: player.getCustomData("sprite") }
                for (const d of data)
                {
                    const resource = this.loadedResources.get(d.sprite);

                    if (resource)
                    {
                        this.context.drawImage(resource, d.position.x, d.position.y);
                    }
                    else
                    {
                        //console.log(`Cannot find resource ${resource}`);
                    }
                }

            }
            else if (event === "set-sprite")
            {
                this.spriteResource = data;
                console.log("Mon sprite est " + data);
            }
        }

        init()
        {
            console.log("Mod001 instancié !");

            document.addEventListener("keydown", (event) => this.onKeyDown(event));

            setTimeout(() =>
            {
                this.sendData("get-sprite", null);
            }, 1000);
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