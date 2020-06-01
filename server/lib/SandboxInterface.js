const fs = require("fs");
const path = require("path");
const LibraryComponent = require("./LibraryComponent");
const ModInterfaceContainer = require("./ModInterfaceContainer");

/*
    L'utilité de l'utilisation de cette classe est la même que pour 'ModInterface' : on charge les
    données nécessaires à une 'SandboxServer' pour fonctionner, sans l'instancier. De cette manière,
    une fois que les données sont chargées correctement, on a plus qu'à instancier une 'SandboxServer'
    de manière synchrone sans se soucier d'éventuels problèmes comme des 'ModServer' malformés ou
    inexistants.

    Les données chargées vont être celles contenues dans le fichier "sandboxconfig.json", puis les UID
    des Mods de ce fichier vont être chargés en tant que 'ModInterface' dans un objet 'ModInterfaceContainer'
    privé, mais en utilisant quand même le 'ModInterfaceContainer' global pour récupérer les instances.

    Un 'SandboxInterface' va émettre des évènements en fonction de l'avancement du chargement, ou des
    erreurs rencontrées.

    Cette classe va fonctionner avec 'SandboxInterfaceContainer', dont l'instance globale va gérer les
    chargements/déchargements de 'SandboxInterface', mais aussi les instanciations de 'SandboxServer'.
*/
class SandboxInterface extends LibraryComponent
{
    constructor(UID)
    {
        super();

        // Avant toute chose, on vérifie la validité de l'UID :
        if (!this.env.get("UIDManager").get("sandbox").isValid(UID))
        {
            throw new Error(`Invalid Sandbox UID #${UID}`);
        }

        this.debug("note", `SandboxInterface #${UID} instancié.`);

        this.UID = UID;

        // On part du principe que le nom de dossier du Sandbox est son UID
        this.folderName = UID;

        this.status = SandboxInterface.LOADING_NOT_STARTED;

        // Données à charger
        this.sandboxConfig = null;
        //MAP ?this.mods = new ModInterfaceContainer();

        this.startLoading();
    }

    /* Initialisation pour le chargement des données */

    startLoading()
    {
        this.debug("note", `Début de chargement du SandboxInterface #${this.UID}.`);

        // Le chargement d'UN élément a rencontré une erreur : on termine sur une erreur
        this.on("elementLoadError", err => this.endWithError(err));

        // Le chargement d'UN élément s'est effectué avec succès
        this.on("elementLoadSuccess", () => this.checkLoadSuccess());

        // Récupération des évènements d'erreurs spécifiques pour émettre un évènement d'erreur générique
        this.on("sandboxconfigLoadError", err => this.emit("elementLoadError", err));

        // Récupération des évènements de chargement spécifiques pour émettre un évènement de chargement générique
        this.on("sandboxconfigLoadSuccess", () => this.emit("elementLoadSuccess"));
        this.on("serverClassLoadSuccess", () => this.emit("elementLoadSuccess"));

        this.changeStatus(SandboxInterface.LOADING_PROGRESS);

        // Appel des méthodes de chargement des données
        this.loadSandboxconfig();
    }

    /* Méthodes qui contrôlent le statut du chargement */

    endWithError(err)
    {
        this.changeStatus(SandboxInterface.LOADING_ERROR);
        this.emit("loadError", err);
    }

    changeStatus(newStatus)
    {
        this.status = newStatus;
        this.emit("statusChange", newStatus);
    }

    checkLoadSuccess()
    {
        if (this.sandboxConfig !== null && this.dependencies.hasAllLoaded())
        {
            this.changeStatus(SandboxInterface.LOADING_SUCCESS);

            // Tous les éléments ont été chargés correctement. L'objet SandboxInterface est utilisable.
            this.emit("loadSuccess");

            this.debug("note", `Composants de MotInterface #${this.UID} chargés avec succès`);
        }
    }

    /* Obtenir des informations sur le statut en cours */

    isFinished()
    {
        return (this.hasSucceeded() || this.hasFailed());
    }

    hasFailed()
    {
        return (this.status === SandboxInterface.LOADING_ERROR);
    }

    hasSucceeded()
    {
        return (this.status === SandboxInterface.LOADING_SUCCESS);
    }

    /* Gestion des chemins */

    get absolutePath()
    {
        return path.join(this.env.get("sandboxPath"), this.folderName);
    }

    get sandboxconfigPath()
    {
        return path.join(this.absolutePath, "sandboxconfig.json");
    }

    /* Chargement des données */

    loadSandboxconfig()
    {
        fs.readFile(this.sandboxconfigPath, "utf8", (err, data) =>
        {
            if (err)
            {
                this.emit("sandboxconfigLoadError", err);
            }
            else
            {
                this.sandboxConfig = JSON.parse(data);
                this.emit("sandboxconfigLoadSuccess");
            }
        });
    }

    /* Instanciation synchrone d'un 'SandboxServer' à partir de l'instance de 'SandboxInterface' */

    instanciateSync()
    {
        // L'instanciation des dépendances va entraîner une réaction en chaîne : instanciation des dépendances des dépendances, etc.

        if (!this.hasSucceeded())
        {
            throw new Error(`Can't instanciate 'SandboxInterface' #${this.UID}, because 'SandboxInterface' isn't loaded`);
        }
        throw new Error("pas encore");//return new this.serverClass(this, null);
    }
}

SandboxInterface.LOADING_NOT_STARTED = 1;
SandboxInterface.LOADING_PROGRESS = 2;
SandboxInterface.LOADING_SUCCESS = 3;
SandboxInterface.LOADING_ERROR = 4;

module.exports = SandboxInterface;