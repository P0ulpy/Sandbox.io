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

        /* Niveau de débug : si le niveau est sur "note", alors "note", "log", "warning" et "error"
        seront affichés. Si vaut "warning", alors seuls "warning" et "error" seront affichés */
        if (debugIndex >= debugMods.indexOf(this.globals.get("debugLevel")))
        {
            console.log(`[${notations[debugIndex]}]`, ...args);
        }
    }
}

module.exports = LibraryComponent;