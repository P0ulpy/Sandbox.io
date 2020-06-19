import fs from "fs";
import path from "path";

import { SandboxUID, ModUID, getModUID, getSandboxUID } from "../UID";
import ElementInterface, { LoadingStatus } from "./ElementInterface";

import ModInterfaceContainer from "../Containers/ModInterfaceContainer";

import env from "../Environment";

type SandboxConfig = {
    UID: SandboxUID;
    size: number;
    name: string;
    MOTD: string;
    mods: ModUID[];
    updateRate: number;
}

export default class SandboxInterface extends ElementInterface
{
    public UID: SandboxUID;
    public folderName: string;
    // @TODO passer le type en sandboxConfig
    public sandboxConfig: SandboxConfig | null = null;
    public modInterfaces: ModInterfaceContainer = new ModInterfaceContainer();

    constructor(UID: SandboxUID)
    {
        super();

        if (!UID.isValid())
        {
            throw new Error(`Invalid Sandbox UID #${UID}`);
        }

        this.debug("note", `SandboxInterface #${UID} instancié.`);

        this.UID = UID;

        // On part du principe que le nom de dossier du Sandbox est son UID
        this.folderName = UID.value;

        this.startLoading();
    }

    /* Initialisation pour le chargement des données */

    startLoading(): void
    {
        super.startLoading();

        // Récupération des évènements d'erreurs spécifiques pour émettre un évènement d'erreur générique
        this.on("sandboxconfigLoadError", err => this.emit("elementLoadError", err));

        // Récupération des évènements de chargement spécifiques pour émettre un évènement de chargement générique
        this.on("sandboxconfigLoadSuccess", () => this.emit("elementLoadSuccess"));
        this.on("serverClassLoadSuccess", () => this.emit("elementLoadSuccess"));

        // Lorsque la configuration de la Sandbox a été chargée, on commence à charger les mods
        this.on("sandboxconfigLoadSuccess", () => this.loadMods());

        // Appel des méthodes de chargement des données
        this.loadSandboxconfig();
    }

    /* Méthodes qui contrôlent le statut du chargement */

    checkLoadSuccess(): void
    {
        if (this.sandboxConfig !== null && this.modInterfaces.isLoaded)
        {
            this.changeStatus("success");

            // Tous les éléments ont été chargés correctement. L'objet SandboxInterface est utilisable.
            this.emit("loadSuccess");

            this.debug("note", `Composants de MotInterface #${this.UID} chargés avec succès`);
        }
    }

    /* Gestion des chemins */

    get absolutePath(): string
    {
        return path.join(env.sandboxPath, this.folderName);
    }

    get sandboxconfigPath(): string
    {
        return path.join(this.absolutePath, "sandboxconfig.json");
    }

    /* Chargement des données */

    loadSandboxconfig(): void
    {
        fs.readFile(this.sandboxconfigPath, "utf8", (err, data) =>
        {
            if (err)
            {
                this.emit("sandboxconfigLoadError", err);
            }
            else
            {
                // Créer un objet typé à partir du JSON
                const sandboxConfig: SandboxConfig = JSON.parse(data, (key: string, value) => {
                    if (key === "UID")
                    {
                        // string -> ModUID
                        return getSandboxUID(value);
                    }
                    else if (key === "mods")
                    {
                        // string[] -> ModUID[]
                        return value.map((UID: string) => getModUID(UID))
                    }
                    return value;
                });

                this.debug("note", `Configuration de SandboxInterface ${this.UID} chargée...`);

                this.sandboxConfig = sandboxConfig;

                this.emit("sandboxconfigLoadSuccess");
            }
        });
    }

    loadMods(): void
    {
        this.debug("note", `Début de chargement des mods ${this.sandboxConfig?.mods} pour SandboxInterface #${this.UID}`);
        // @TODO dégueu, mais sinon TypeScript me saoule en mode "it should be null" eh ferme là un peu tu veux ?
        this.modInterfaces.load((this.sandboxConfig as SandboxConfig).mods)
        .then(() => this.emit("elementLoadSuccess"))
        .catch(err => this.emit("elementLoadError", err));
    }

    /* Instanciation asynchrone d'un 'SandboxServer' à partir de  l'instance de 'SandboxInterface' */

    instanciate()
    {
        if (!this.hasSucceeded())
        {
            throw new Error(`Can't instanciate 'SandboxInterface' #${this.UID}, because 'SandboxInterface' isn't loaded`);
        }
    }
}