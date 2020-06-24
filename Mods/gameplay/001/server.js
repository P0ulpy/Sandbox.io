module.exports = function(GameplayMod)
{
    return class Mod001 extends GameplayMod
    {
        constructor(config)
        {
            super(config);

            this.init();
        }

        init()
        {
            this.on("test", (data) => { console.log("test recu : " + data) });
            //this.on("test", onTest);
            //this.on("test", (data) => { this.onTest(data) });
            //this.on("test", this.onTest);

            this.on("receiveData", (event, data) => { console.log("event : " + event + ", data : " + data)});

            setInterval(() => { this.emit("sendData", "dataFromServer", "bonjour"); }, 1000);
        }
    }
};