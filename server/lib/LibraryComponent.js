const EventEmitter = require("events").EventEmitter;
// But de cette classe :
// être dérivée par chaque module pour bénéficier de méthodes d'aide

class LibraryComponent extends EventEmitter
{
    constructor()
    {
        super();
        // METTRE EN PLACE SYSTEME DE RESTRICTIONS EN FONCTION DES CLASSES
        // PAR EXEMPLE SERVERMOD NE PEUT PAS ACCEDER A TELS ELEMENTS

        // AMELIORER SYSTEME DE debug à partir de this (infos de this)

        this.env = LibraryComponent.Namespace.env;
        this.constructors = LibraryComponent.Namespace.constructors;
    }

    debug(level, ...args)
    {
        const debugMods = [ "note", "log" ,"warning", "error" ],
              notations = [ "+", "~", "!", "-" ],
              colors    = [ "\x1b[37m", "\x1b[34m", "\x1b[33m", "\x1b[31m" ];
        const debugIndex = debugMods.indexOf(level);

        /* Niveau de débug : si le niveau est sur "note", alors "note", "log", "warning" et "error"
        seront affichés. Si vaut "warning", alors seuls "warning" et "error" seront affichés */
        if (debugIndex >= debugMods.indexOf(this.env.get("debugLevel")))
        {
            console.log(`${colors[debugIndex]}%s\x1b[0m`, `[${notations[debugIndex]}]`, ...args);
        }
    }
}

module.exports = LibraryComponent;