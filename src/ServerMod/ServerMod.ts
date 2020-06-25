import { EventEmitter } from "events";
import { ModConfig, Resource } from "../LoadingMod";
import env from "../Environment";
import { ModUID } from "../UID";

// Données stockées dans une instance de ServerMod, récupérées depuis le fichier de configuration
interface ServerModData {
    UID: ModUID;
    name: string;
    description: string;
    version: string;
    resources: Resource[]
}

export interface ServerModPublicData {
    UID: string;
    name: string;
    description: string;
    version: string;
    resources: Resource[]
}

export default abstract class ServerMod extends EventEmitter implements ServerModData
{
    public UID: ModUID;
    public name: string;
    public description: string;
    public version: string;
    public resources: Resource[];

    constructor(config: ModConfig)
    {
        super();

        ({
            UID: this.UID,
            name: this.name,
            description: this.description,
            version: this.version,
            resources: this.resources
        } = config);

        if (!config)
        {
            env.logger.warning("Config is undefined");
        }

        console.log(`Hello from ${this.constructor.name}`);
    }

    public abstract get publicData(): ServerModPublicData;
}