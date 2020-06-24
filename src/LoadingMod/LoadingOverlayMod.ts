import LoadingMod, { ModConfig } from "./LoadingMod";
import { ModUID } from "../UID";

export interface OverlayModConfig extends ModConfig {}

export default class LoadingOverlayMod extends LoadingMod
{
    constructor(UID: ModUID)
    {
        super(UID, "overlay");
    }

    protected async getConfig(): Promise<OverlayModConfig>
    {
        try
        {
            const JSONData: string = await this.loadConfigFile();
            const config: OverlayModConfig = this.JSONtoModConfig(JSONData);

            return config;
        }
        catch (error)
        {
            throw error;
        }
    }

    protected JSONtoModConfig(JSONData: string): OverlayModConfig
    {
        const config: OverlayModConfig = JSON.parse(JSONData, (key, value) =>
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