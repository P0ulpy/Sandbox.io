module.exports = function(OverlayMod)
{
    return class Mod002 extends OverlayMod
    {
        constructor(config)
        {
            super(config);
        }
    
        init()
        {
            this.on("test", (data) => { console.log("test recu : " + data) });
            //this.on("test", onTest);
            //this.on("test", (data) => { this.onTest(data) });
            //this.on("test", this.onTest);
        }
    
        onTest(data)
        {
            console.log(`[onTest] : ${data}`);
        }
    }
};