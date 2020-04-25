const EventEmitter = require("events").EventEmitter;
// But de cette classe :
// être dérivée par chaque module pour bénéficier de méthodes d'aide

class LibraryComponent extends EventEmitter
{
    getGlobal(key)
    {
        return LibraryComponent.Namespace.getGlobal(key);
    }

    // mod = [ "note", "warning", "error" ]
    debug(mod, ...args)
    {
        // const debugLevel = this.getGlobal("debugLevel");
        // if (debugLevel === 1) ...
        console.log(...args);
    }
}

module.exports = LibraryComponent;