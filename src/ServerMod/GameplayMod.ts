import ServerMod from "./ServerMod";
import { ModConfig } from "../LoadingMod";
import { ServerModPublicData } from "./ServerMod";
import { Player } from "../Room";

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
            UID: this.UID.value,
            name: this.name,
            description: this.description,
            version: this.version,
            resources: this.resources
        }
    }

    public update(): void {}

    public sendToPlayer(player: Player, event: string, data: any): void
    {
        player.socket.emit("gameplay", { targetEvent: event, data: data });
    }

    public sendToBroadcast(event: string, data: any): void
    {
        this.room?.sendBroadcast("gameplay", { targetEvent: event, data: data });
    }

    public onReceiveData(player: Player, event: string, data: any): void
    {
        
    }
}