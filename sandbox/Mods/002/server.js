const Sandbox = require("../../");

class MyMod2 extends Sandbox.ServerMod
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

module.exports = function(config) { return new MyMod2(config); };