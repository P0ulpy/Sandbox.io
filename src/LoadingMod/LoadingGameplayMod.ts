import LoadingMod, { ModConfig } from "./LoadingMod";
import { ModUID } from "../UID";

export interface GameplayModConfig extends ModConfig {}

export default class LoadingGameplayMod extends LoadingMod
{
    constructor(UID: ModUID)
    {
        super(UID, "gameplay");
    }

    protected async getConfig(): Promise<GameplayModConfig>
    {
        try
        {
            const JSONData: string = await this.loadConfigFile();
            const config: GameplayModConfig = this.JSONtoModConfig(JSONData);

            return config;
        }
        catch (error)
        {
            throw error;
        }
    }

    protected JSONtoModConfig(JSONData: string): GameplayModConfig
    {
        const config: GameplayModConfig = JSON.parse(JSONData, (key, value) =>
        {
            if (key === "UID")
            {
                return new ModUID(value);
            }
            return value;
        });

        return config;
    }
}