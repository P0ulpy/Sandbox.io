import ServerMod from "./ServerMod";
import { ModConfig } from "../LoadingMod";
import { ServerModPublicData } from "./ServerMod";
import { Player } from "../Room";

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

    public sendToPlayer(player: Player, event: string, data: any): void
    {
        player.socket.emit("overlay", { targetEvent: event, data: data });
    }

    public onReceiveData(player: Player, event: string, data: any): void
    {
        
    }
}