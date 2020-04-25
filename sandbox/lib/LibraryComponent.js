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

    debug(level, ...args)
    {
        const debugMods = [ "note", "log" ,"warning", "error" ], notations = [ "+", "~", "!", "-" ];
        const debugIndex = debugMods.indexOf(level);

        if (debugIndex >= debugMods.indexOf(this.globals.get("debugLevel")))
        {
            console.log(`[${notations[debugIndex]}]`, ...args);
        }
    }

    // Version statique : pas ouf comme code, en attente d'une solution meilleure
    static debug(level, ...args)
    {
        const debugMods = [ "note", "log", "warning", "error" ], notations = [ "+", "~", "!", "-" ];
        const debugIndex = debugMods.indexOf(level);

        if (debugIndex >= debugMods.indexOf(LibraryComponent.Namespace.globals.get("debugLevel")))
        {
            console.log(`[${notations[debugIndex]}]`, ...args);
        }
    }
}

module.exports = LibraryComponent;