import ServerMod from "./ServerMod";
import { ModConfig } from "../LoadingMod";
import { ServerModPublicData } from "./ServerMod";

export interface GameplayModPublicData extends ServerModPublicData {}

export default class GameplayMod extends ServerMod
{
    constructor(config: ModConfig)
    {
        super(config);
    }

    public get publicData(): GameplayModPublicData
    {
        return {
            UID: this.UID,
            name: this.name,
            description: this.description
        }
    }
}