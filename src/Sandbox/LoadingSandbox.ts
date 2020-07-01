import { readFile } from "fs/promises";
import { join } from "path";

import { SandboxUID, ModUID, getSandboxUID, getModUID } from "../UID";
import env from "../Environment";
import ServerSandbox, { ServerSandboxConfig } from "./ServerSandbox";
import { GameplayMod, OverlayMod, EnvironmentMod } from "../ServerMod";
import { LoadingGameplayMod, LoadingOverlayMod, LoadingEnvironmentMod } from "../LoadingMod";

// Représente le format de l'objet contenu dans le fichier de configuration d'une Sandbox,
// après transformation
export type SandboxConfig = {
    UID: SandboxUID;
    size: number;
    name: string;
    MOTD: string;
    updateRate: number;
    mods: SandboxMods;
}

type SandboxMods = {
    gameplay: ModUID;
    overlay: ModUID;
    environment: ModUID;
}

class LoadingSandboxError extends Error{}

// @TODO utiliser interface PromiseLike<T>
export default class LoadingSandbox
{
    private static configFileName = "sandboxconfig.json";

    private loadingPromise: Promise<ServerSandbox> | null;
    private UID: SandboxUID;
    private folderName: string;
    private error: LoadingSandboxError | null = null;

    constructor(UID: SandboxUID)
    {
        if (!UID.isValid())
        {
            this.error = new LoadingSandboxError(`Can't load Sandbox #${UID} : invalid UID`);
            env.logger.error(this.error.message);
            throw this.error;
        }

        this.UID = UID;
        this.folderName = this.UID.value;

        this.loadingPromise = new Promise<ServerSandbox>(async (resolve, reject) =>
        {
            try
            {
                // @TODO : pas optimisé : on attend qu'une promesse soit résolue pour
                // déclencher une autre alors qu'elle n'a pas forcément besoin du résultat de
                // la précédente, mais bon c'est bien plus fiable et de toutes façons on peut
                // toujours charger plusieurs sandboxes en même temps
                const config: SandboxConfig = await this.getConfig();

                const mods: SandboxMods = config.mods;

                // Instances des mods
                const gameplayMod: GameplayMod = await this.getGameplayMod(mods.gameplay);
                const overlayMod: OverlayMod = await this.getOverlayMod(mods.overlay);
                const environmentMod: EnvironmentMod = await this.getEnvironmentMod(mods.environment);

                // Maintenant qu'on a tout : la configuration de la sandbox et ses instances de
                // mods, on peut l'instancier
                const serverSandboxConfig: ServerSandboxConfig = {
                    environmentMod: environmentMod,
                    gameplayMod: gameplayMod,
                    overlayMod: overlayMod,
                    config: config
                };

                const serverSandbox = new ServerSandbox(serverSandboxConfig);

                env.logger.info(`Successfully created Sandbox #${UID}`);

                resolve(serverSandbox);
            }
            catch (error)
            {
                reject(error);
            }
        });

        this.loadingPromise.catch((reason: Error) => env.logger.error(reason.message));
    }

    public get promise(): Promise<ServerSandbox>
    {
        if (this.loadingPromise)
        {
            return this.loadingPromise;
        }

        return Promise.reject<ServerSandbox>(this.error);
    }

    private get sandboxPath(): string
    {
        return join(env.sandboxPath, this.folderName);
    }

    private get configFilePath(): string
    {
        return join(this.sandboxPath, LoadingSandbox.configFileName);
    }

    // @TODO pas propre les any mais pratique
    /*public then(callback: any): Promise<any>
    {
        return this.loadingPromise.then(callback);
    }*/

    // @TODO pas propre les any mais pratique
    /*public catch(callback: any): Promise<any>
    {
        return this.loadingPromise.catch(callback);
    }*/

    private loadConfigFile(): Promise<string>
    {
        return readFile(this.configFilePath, { encoding: "utf-8" });
    }

    private async getConfig(): Promise<SandboxConfig>
    {
        try
        {
            const JSONData: string = await this.loadConfigFile();
            const config: SandboxConfig = this.JSONtoSandboxConfig(JSONData);

            return config;
        }
        catch (error)
        {
            throw error;
        }
    }

    // @TODO attention, c'est pas pcq ça retourne le bon type que les données sont présentes
    private JSONtoSandboxConfig(JSONData: string): SandboxConfig
    {
        const config: SandboxConfig = JSON.parse(JSONData, (key, value) =>
        {
            if (key === "UID")
            {
                return getSandboxUID(value);
            }
            else if (key ===  "mods")
            {
                // @TODO Value vaut un objet. On le transforme en JSON. Pas opti, mais plus lisible
                return this.JSONtoSandboxMods(JSON.stringify(value));
            }
            return value;
        });

        return config;
    }

    // @TODO attention, c'est pas pcq ça retourne le bon type que les données sont présentes
    private JSONtoSandboxMods(JSONData: string): SandboxMods
    {
        const mods: SandboxMods = JSON.parse(JSONData, (key, value) =>
        {
            // @TODO utiliser type Mod
            if (key === "gameplay" || key === "overlay" || key === "environment")
            {
                return getModUID(value);
            }
            return value;
        });

        return mods;
    }

    private getGameplayMod(UID: ModUID): Promise<GameplayMod>
    {
        return (new LoadingGameplayMod(UID)).promise;
    }

    private getOverlayMod(UID: ModUID): Promise<OverlayMod>
    {
        return (new LoadingOverlayMod(UID)).promise;
    }

    private getEnvironmentMod(UID: ModUID): Promise<EnvironmentMod>
    {
        return (new LoadingEnvironmentMod(UID)).promise;
    }
}