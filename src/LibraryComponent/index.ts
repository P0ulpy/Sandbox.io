import { EventEmitter } from "events";

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
    }

    debug(level: string, ...args: string[]): void
    {
<<<<<<< Updated upstream:server/lib/LibraryComponent.js
=======
        // @TODO Créer types/enums ici
        // @TODO classe logger
>>>>>>> Stashed changes:src/LibraryComponent/index.ts
        const debugMods = [ "note", "log" ,"warning", "error" ],
              notations = [ "+", "~", "!", "-" ],
              colors    = [ "\x1b[37m", "\x1b[34m", "\x1b[33m", "\x1b[31m" ];
        const debugIndex = debugMods.indexOf(level);

        /* Niveau de débug : si le niveau est sur "note", alors "note", "log", "warning" et "error"
        seront affichés. Si vaut "warning", alors seuls "warning" et "error" seront affichés */
        const debugLevel = "note";
        // @TODO faire classe logger
        if (debugIndex >= debugMods.indexOf(/*this.env.debugLevel*/debugLevel))
        {
            console.log(`${colors[debugIndex]}%s\x1b[0m`, `[${notations[debugIndex]}]`, ...args);
        }
    }
}

export default LibraryComponent;