const fs = require("fs");
const path = require("path");
const LibraryComponent = require("./LibraryComponent.js");

/* Cette classe ainsi que ModInterfaceContainer sont le résultat de la réécriture complète de
ModLoader et de ModParser, de manière beaucoup plus propre, le but étant qu'elles soient le plus
simple à utiliser de l'extérieur. */

/*
    Un 'ModInterface' représente un Mod stocké en dur sur le serveur. L'instanciation d'un
    ModInterface va automatiquement charger les composants du Mod, mais SANS l'instancier :
    - 'modConfig' contient les données du fichier "modconfig.json", et éventuellement d'autres
    données qui seront ajoutées lors du fonctionnement de l'application
    - 'serverClass' contient la classe 'ModServer', qui pourra être instanciée ultérieurement
    - 'dependancies' contient une collection d'autres 'ModInterface', qui sont les Mods dont dépend
    celui-ci

    Un ModInterface va émettre des évènements en fonction de l'avancement du chargement, ou des
    erreurs rencontrées.

    La classe 'ModInterfaceContainer' contiendra une collection de 'ModInterface', et son instance
    globale sera disponible via SandboxNamespace.env.get("ModInterfaceContainer"). Celle-ci va stocker
    toutes les instances de 'ModInterface' chargées ou en cours de chargement. Elle s'occupera de
    dynamiquement charger un 'ModInterface' lors de l'accès de celui-ci s'il n'est pas déjà chargé.
    Les dépendances d'un 'ModInterface' proviendront directement de cette instance de
    'ModInterfaceContainer'.
*/
class ModInterface extends LibraryComponent
{
    // On part du principe que l'UID est le nom du dossier du Mod
    constructor(UID)
    {
        super();

        this.debug("note", `ModInterface #${UID} instancié.`)

        // Avant toute chose, on vérifie la validité de l'UID :
        if (!this.env.get("UIDManager").get("mod").isValid(UID))
        {
            throw new Error(`Invalid mod UID #${UID}`);
        }

        this.UID = UID;

        // On part du principe que le nom de dossier du Mod est son UID
        this.folderName = UID;

        this.status = ModInterface.LOADING_NOT_STARTED;

        // Données à charger
        this.serverClass = null;
        this.modConfig = null;
        // SOCCUPER DES DEPENDANCES

        this.startLoading();
    }

    /* Initialisation pour le chargement des données */

    startLoading()
    {
        this.debug("note", `Début de chargement du ModInterface #${this.UID}.`);

        // Le chargement d'UN élément a rencontré une erreur : on termine sur une erreur
        this.on("elementLoadError", () => this.endWithError());
        // La chargement d'UN élément s'est effectué avec succès
        this.on("elementLoadSuccess", () => this.checkLoadSuccess());

        // Récupération des évènements d'erreurs spécifiques pour émettre un évènement d'erreur générique
        this.on("modconfigLoadError", () => this.emit("elementLoadError"));
        this.on("serverClassLoadError", () => this.emit("elementLoadError"));

        // Récupération des évènements de chargement spécifiques pour émettre un évènement de chargement générique
        this.on("modconfigLoadSuccess", () => this.emit("elementLoadSuccess"));
        this.on("serverClassLoadSuccess", () => this.emit("elementLoadSuccess"));

        // Appel des méthodes de chargement des données
        this.loadModconfig();
        this.loadServerClass();

        this.changeStatus(ModInterface.LOADING_PROGRESS);
    }

    /* Méthodes qui contrôlent le statut du chargement */

    endWithError()
    {
        this.changeStatus(ModInterface.LOADING_ERROR);
        this.emit("loadError");

        // Éventuellement, arrêter le chargement des autres données
    }

    changeStatus(newStatus)
    {
        this.status = newStatus;
        this.emit("statusChange", newStatus);
    }

    checkLoadSuccess()
    {
        if (this.serverClass !== null && this.modConfig !== null)
        {
            this.changeStatus(ModInterface.LOADING_SUCCESS);
            // Tous les éléments ont été chargés correctement. L'objet ModInterface est utilisable.
            this.emit("loadSuccess");
        }
    }

    /* Obtenir des informations sur le statut en cours */

    isFinished()
    {
        return (this.hasSucceeded() || this.hasFailed());
    }

    hasFailed()
    {
        return (this.status === ModInterface.LOADING_ERROR);
    }

    hasSucceeded()
    {
        return (this.status === ModInterface.LOADING_SUCCESS);
    }

    /* Gestion des chemins */

    get absolutePath()
    {
        return path.join(this.env.get("modPath"), this.folderName);
    }

    get modconfigPath()
    {
        return path.join(this.absolutePath, "modconfig.json");
    }

    get clientClassPath()
    {
        return path.join(this.absolutePath, "client.js");
    }

    get serverClassPath()
    {
        return path.join(this.absolutePath, "server.js");
    }

    /* Chargement des données */

    loadModconfig()
    {
        fs.readFile(this.modconfigPath, "utf8", (err, data) =>
        {
            if (err)
            {
                this.emit("modconfigLoadError", err);
            }
            else
            {
                this.modConfig = JSON.parse(data);
                this.emit("modconfigLoadSuccess");
            }
        });
    }

    loadServerClass()
    {
        try
        {
            const serverClass = require(this.serverClassPath)(this.constructors.ServerMod);

            this.serverClass = serverClass;
            this.emit("serverClassLoadSuccess");
        }
        catch (err)
        {
            this.emit("serverClassLoadError", err);
        }
    }
}

ModInterface.LOADING_NOT_STARTED = 1;
ModInterface.LOADING_PROGRESS = 2;
ModInterface.LOADING_SUCCESS = 3;
ModInterface.LOADING_ERROR = 4;

module.exports = ModInterface;