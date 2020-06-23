import { EventEmitter } from "events";
import { ModConfig } from "../LoadingMod";
import env from "../Environment";
import { ModUID } from "../UID";

export interface ServerModPublicData {
    UID: ModUID;
    name: string;
    description: string;
}

export default abstract class ServerMod extends EventEmitter implements ServerModPublicData
{
    public UID: ModUID;
    public name: string;
    public description: string;

    constructor(config: ModConfig)
    {
        super();

        ({
            UID: this.UID,
            name: this.name,
            description: this.description
        } = config);

        if (!config)
        {
            env.logger.warning("Config is undefined");
        }

        console.log(`Hello from ${this.constructor.name}`);
    }

    public abstract get publicData(): ServerModPublicData;
}