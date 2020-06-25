import ServerMod from "./ServerMod";
import { ModConfig } from "../LoadingMod";
import { ServerModPublicData } from "./ServerMod";

export interface EnvironmentModPublicData extends ServerModPublicData {}

export default class EnvironmentMod extends ServerMod
{
    constructor(config: ModConfig)
    {
        super(config);
    }

    public get publicData(): EnvironmentModPublicData
    {
        return {
            UID: this.UID.value,
            name: this.name,
            description: this.description,
            version: this.version,
            resources: this.resources
        }
    }
}