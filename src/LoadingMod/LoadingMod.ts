import { join } from "path";
import { readFile, access } from "fs/promises";

import { ModUID } from "../UID";
import env from "../Environment";
import { ServerMod, GameplayMod, OverlayMod, EnvironmentMod } from "../ServerMod/";
import { Room } from "../Room";

export type ModCategory = "gameplay" | "overlay" | "environment";

type ResourceType = "image"

export type Resource = {
    name: string;
    filename: string;
    type: ResourceType,
    height: number,
    width: number
}

export interface ModConfig {
    UID: ModUID;
    name: string;
    description: string;
    version: string;
    resources: Resource[];
}

export default abstract class LoadingMod
{
    private static configFileName: string = "modconfig.json";
    private static clientClassFileName: string = "client.js";
    private static serverClassFileName: string = "server.js";
    // Mapping des classes à dériver en fonction de leur catégorie
    private static serverModClasses: Map<ModCategory, typeof ServerMod> =
    new Map<ModCategory, typeof ServerMod>([
        [ "gameplay", GameplayMod ],
        [ "overlay", OverlayMod ],
        [ "environment", EnvironmentMod ]
    ]);

    private UID: ModUID;
    private loadingPromise: Promise<ServerMod>;
    protected folderName: string;
    protected category: ModCategory;

    constructor(UID: ModUID, category: ModCategory)
    {
        if (!UID.isValid())
        {
            const err = new Error(`Can't load ${this.constructor.name} #${UID} : invalid UID`);

            env.logger.error(err.message);
            this.loadingPromise = Promise.reject(err);

            // @TODO vraiment nécessaire ?
            throw err;
        }

        this.UID = UID;
        this.category = category;

        this.folderName = this.UID.value;

        // @TODO essayer d'avoir un truc dynamique plus précis que ServerMod qui peut être
        // un EnvironmentMod, un OverlayMod, ou encore un GameplayMod en se basant sur la map
        // statique
        this.loadingPromise = new Promise<ServerMod>(async (resolve, reject) =>
        {
            try
            {
                const config: ModConfig = await this.getConfig();

                await this.checkClientFileAccess();

                // Récupération de la classe serveur
                // @TODO voir si possible qu'elle soit en TypeScript ?
                const baseModClass = LoadingMod.serverModClasses.get(this.category);
                // On se retrouve avec la classe du Mod, qu'il nous suffit d'instancier
                const ServerModClass = require(this.serverClassFilePath)(baseModClass);

                const modInstance = new ServerModClass(config);

                resolve(modInstance);
            }
            catch (error)
            {
                reject(error);
            }
        });

        this.loadingPromise.catch((reason: Error) => env.logger.error(reason.message));
    }

    public get promise(): Promise<ServerMod>
    {
        return this.loadingPromise;
    }

    protected get modPath(): string
    {
        return join(env.modPath, this.category, this.folderName);
    }

    protected get configFilePath(): string
    {
        return join(this.modPath, LoadingMod.configFileName);
    }

    private get clientClassFilePath(): string
    {
        return join(this.modPath, LoadingMod.clientClassFileName);
    }

    private get serverClassFilePath(): string
    {
        return join(this.modPath, LoadingMod.serverClassFileName);
    }

    protected loadConfigFile(): Promise<string>
    {
        return readFile(this.configFilePath, { encoding: "utf-8" });
    }

    private checkClientFileAccess(): Promise<void>
    {
        return access(this.clientClassFilePath);
    }

    protected abstract async getConfig(): Promise<ModConfig>;

    protected abstract JSONtoModConfig(JSONData: string): ModConfig;
}