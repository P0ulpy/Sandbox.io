import { EnvironmentMod, EnvironmentModPublicData, GameplayMod, GameplayModPublicData, OverlayMod, OverlayModPublicData } from "../ServerMod";
import { SandboxConfig } from "./LoadingSandbox";
import { SandboxUID } from "../UID";
import { Room, Player } from "../Room";

export type ServerSandboxConfig = {
    environmentMod: EnvironmentMod;
    gameplayMod: GameplayMod;
    overlayMod: OverlayMod;
    config: SandboxConfig;
    room: Room;
}

export type ServerSandboxPublicData = {
    UID: string;
    size: number;
    name: string;
    MOTD: string;
    mods: SandboxModsPublicData;
}

type SandboxModsPublicData = {
    overlay: OverlayModPublicData;
    environment: EnvironmentModPublicData;
    gameplay: GameplayModPublicData;
}


export default class ServerSandbox
{
    // @TODO utiliser interface ?
    // Propriétés de la Sandbox
    private environmentMod: EnvironmentMod;
    private gameplayMod: GameplayMod;
    private overlayMod: OverlayMod;
    private UID: SandboxUID;
    public size: number;
    private name: string;
    private MOTD: string;
    private updateRate: number;
    public room: Room | null = null;

    // Propriétés nécessaires à son fonctionnement

    constructor(sandboxConfig: ServerSandboxConfig)
    {
        ({
            environmentMod: this.environmentMod,
            gameplayMod: this.gameplayMod,
            overlayMod: this.overlayMod,
        } = sandboxConfig);

        ({
            UID: this.UID,
            size: this.size,
            name: this.name,
            MOTD: this.MOTD,
            updateRate: this.updateRate
        } = sandboxConfig.config);

        this.room = sandboxConfig.room;
        this.environmentMod.room = this.room;
        this.gameplayMod.room = this.room;
        this.overlayMod.room = this.room;

        this.init();
    }

    public init()
    {
        setInterval(() =>
        {
            this.environmentMod.update();
            this.gameplayMod.update();
            this.overlayMod.update();
        }, 50);
    }

    // Données publiques auxquelles les clients peuvent accéder
    public get publicData(): ServerSandboxPublicData
    {
        return {
            UID: this.UID.value,
            size: this.size,
            name: this.name,
            MOTD: this.MOTD,
            mods: {
                overlay: this.overlayMod.publicData,
                environment: this.environmentMod.publicData,
                gameplay: this.gameplayMod.publicData,
            }
        };
    }

    public onGameplayModReceiveData(player: Player, targetEvent: string, data: any): void
    {
        this.gameplayMod.onReceiveData(player, targetEvent, data);
    }

    public onOverlayModReceiveData(player: Player, targetEvent: string, data: any): void
    {
        this.overlayMod.onReceiveData(player, targetEvent, data);
    }

    public onEnvironmentModReceiveData(player: Player, targetEvent: string, data: any): void
    {
        this.environmentMod.onReceiveData(player, targetEvent, data);
    }
}