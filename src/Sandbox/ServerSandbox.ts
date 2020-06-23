import { EnvironmentMod, EnvironmentModPublicData, GameplayMod, GameplayModPublicData, OverlayMod, OverlayModPublicData } from "../ServerMod";
import { SandboxConfig } from "./LoadingSandbox";
import { SandboxUID } from "../UID";

export type ServerSandboxConfig = {
    environmentMod: EnvironmentMod;
    gameplayMod: GameplayMod;
    overlayMod: OverlayMod;
    config: SandboxConfig;
}

export type ServerSandboxPublicData = {
    UID: SandboxUID;
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
    private size: number;
    private name: string;
    private MOTD: string;
    private updateRate: number;

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
    }

    // Données publiques auxquelles les clients peuvent accéder
    public get publicData(): ServerSandboxPublicData
    {
        return {
            UID: this.UID,
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
}