import LoadingMod, { ModConfig } from "./LoadingMod";
import { ModUID } from "../UID";

export interface EnvironmentModConfig extends ModConfig {}

export default class LoadingEnvironmentMod extends LoadingMod
{
    constructor(UID: ModUID)
    {
        super(UID, "environment");
    }

    protected async getConfig(): Promise<EnvironmentModConfig>
    {
        try
        {
            const JSONData: string = await this.loadConfigFile();
            const config: EnvironmentModConfig = this.JSONtoModConfig(JSONData);

            return config;
        }
        catch (error)
        {
            throw error;
        }
    }

    protected JSONtoModConfig(JSONData: string): EnvironmentModConfig
    {
        const config: EnvironmentModConfig = JSON.parse(JSONData, (key, value) =>
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