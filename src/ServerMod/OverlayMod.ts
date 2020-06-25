import ServerMod from "./ServerMod";
import { ModConfig } from "../LoadingMod";
import { ServerModPublicData } from "./ServerMod";

export interface OverlayModPublicData extends ServerModPublicData {}

export default class OverlayMod extends ServerMod
{
    constructor(config: ModConfig)
    {
        super(config);
    }

    public get publicData(): OverlayModPublicData
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