import { EnvironmentMod, GameplayMod, OverlayMod } from "../ServerMod";
import { SandboxConfig } from "./LoadingSandbox";

export type ServerSandboxConfig = {
    environmentMod: EnvironmentMod;
    gameplayMod: GameplayMod;
    overlayMod: OverlayMod;
    config: SandboxConfig;
}

export default class ServerSandbox
{
    constructor(sandboxConfig: ServerSandboxConfig)
    {
        console.log(sandboxConfig);
    }
}