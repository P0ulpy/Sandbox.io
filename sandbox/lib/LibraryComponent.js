const EventEmitter = require("events").EventEmitter;
// But de cette classe :
// être dérivée par chaque module pour bénéficier de méthodes d'aide

class LibraryComponent extends EventEmitter
{
    constructor()
    {
        super();

        this.globals = LibraryComponent.Namespace.globals;
        this.constructors = LibraryComponent.Namespace.constructors;
    }

    debug(mod, ...args)
    {
        const debugMods = [ "note", "warning", "error" ];

        if (debugMods.indexOf(mod) >= this.getGlobal("debugLevel"))
        {
            console.log(...args);
        }
    }
}

module.exports = LibraryComponent;