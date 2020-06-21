import fs from "fs";
import path from "path";

import ElementInterface, { ModInterfaceDependencies } from "./index";
import { ModUID, getModUID } from "../UID";
import ModServer from "../Mod/ModServer";
import env from "../Environment";

export type ModConfig =  {
    UID: ModUID,
    name: string,
    version: string,
    dependencies: ModUID[]
};

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
    globale sera disponible via SandboxNamespace.env.ModInterfaceContainer. Celle-ci va stocker
    toutes les instances de 'ModInterface' chargées ou en cours de chargement. Elle s'occupera de
    dynamiquement charger un 'ModInterface' lors de l'accès de celui-ci s'il n'est pas déjà chargé.
    Les dépendances d'un 'ModInterface' proviendront directement de cette instance de
    'ModInterfaceContainer'.
*/

export default class ModInterface extends ElementInterface
{
    public UID: ModUID;
    public folderName: string;
    // Données à charger
    public serverClass: FunctionConstructor | null = null;
    public modConfig: ModConfig | null = null;
    public dependencies: ModInterfaceDependencies = new ModInterfaceDependencies(this);

    // On part du principe que l'UID est le nom du dossier du Mod
    constructor(UID: ModUID)
    {
        super();

        // Avant toute chose, on vérifie la validité de l'UID :
        if (!UID.isValid())
        {
            throw new Error(`Invalid mod UID #${UID}`);
        }

        this.debug("note", `ModInterface #${UID} instancié.`);

        this.UID = UID;

        // On part du principe que le nom de dossier du Mod est son UID
        this.folderName = UID.value;

        this.startLoading();
    }

    /* Initialisation pour le chargement des données */

    startLoading(): void
    {
        super.startLoading();

        // Le chargement d'UNE dépendance a échoué
        this.on("loadDependencyError", err => this.endWithError(err));

        // Toutes les dépendances ont été chargées correctement
        this.on("loadAllDependencies", () => this.debug("log", `Successfully loaded ${this.dependencies.size} dependencies for Mod #${this.UID}`));
        this.on("loadAllDependencies", () => this.emit("elementLoadSuccess"));

        // Récupération des évènements d'erreurs spécifiques pour émettre un évènement d'erreur générique
        this.on("modconfigLoadError", err => this.emit("elementLoadError", err));
        this.on("serverClassLoadError", err => this.emit("elementLoadError", err));

        // Récupération des évènements de chargement spécifiques pour émettre un évènement de chargement générique
        this.on("modconfigLoadSuccess", () => this.emit("elementLoadSuccess"));
        this.on("serverClassLoadSuccess", () => this.emit("elementLoadSuccess"));

        this.on("loadDependencySuccess", dep => this.debug("note", `La dépendance #${dep.UID} vient d'être chargée pour le Mod #${this.UID}`));

        // Appel des méthodes de chargement des données
        this.loadModconfig();
        this.loadServerClass();
    }

    /* Méthodes qui contrôlent le statut du chargement */

    checkLoadSuccess(): void
    {
        if (this.serverClass !== null && this.modConfig !== null && this.dependencies.hasAllLoaded())
        {
            this.changeStatus("success");

            // Tous les éléments ont été chargés correctement. L'objet ModInterface est utilisable.
            this.emit("loadSuccess");

            this.debug("log", `Composants de MotInterface #${this.UID} chargés avec succès`);
        }
    }

    /* Gestion des chemins */

    get absolutePath(): string
    {
        return path.join(env.modPath, this.folderName);
    }

    get modconfigPath(): string
    {
        return path.join(this.absolutePath, "modconfig.json");
    }

    get clientClassPath(): string
    {
        return path.join(this.absolutePath, "client.js");
    }

    get serverClassPath(): string
    {
        return path.join(this.absolutePath, "server.js");
    }

    /* Chargement des données */

    loadModconfig(): void
    {
        fs.readFile(this.modconfigPath, "utf8", (err, data) =>
        {
            if (err)
            {
                this.debug("error", `Can't load file ${this.modconfigPath}...`);
                this.emit("modconfigLoadError", err);
            }
            else
            {
                const modConfig: ModConfig = JSON.parse(data, (key, value) => {
                    if (key === "UID")
                    {
                        return getModUID(value);
                    }
                    else if (key === "dependencies")
                    {
                        return value.map((UID: string) => getModUID(UID));
                    }
                    return value;
                });

                this.modConfig = modConfig;

                this.emit("modconfigLoadSuccess");
            }
        });
    }

    loadServerClass(): void
    {
        fs.stat(this.serverClassPath, (err) => {
            if (err)
            {
                this.debug("error", `Can't find file ${this.serverClassPath}.`);
                this.emit("serverClassLoadError", err);
            }
            else
            {
                this.serverClass = require(this.serverClassPath)(ModServer);
                this.emit("serverClassLoadSuccess");
            }
        });
    }
}