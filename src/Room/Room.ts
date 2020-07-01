import { EventEmitter } from "events";
import { Socket } from "socket.io";

import { SandboxUID } from "../UID";
import { LoadingSandbox, ServerSandbox, ServerSandboxPublicData } from "../Sandbox";
import SocketManager from "../SocketManager";
import Player from "./Player";
import env from "../Environment";


export interface RoomPublicData extends ServerSandboxPublicData
{
    playersCount: number;
}

export type RoomLoadingStatus = "loading" | "success" | "error";

export class RoomError extends Error {}

export default class Room extends EventEmitter
{
    private sandboxUID: SandboxUID;
    private loadingSandbox: LoadingSandbox;
    // @TODO pas ouf
    private serverSandbox: ServerSandbox | null = null;
    private loadingStatus: RoomLoadingStatus = "loading";
    private loadingPromise: Promise<void>;
    private socketManager: SocketManager | null = null;
    public players: Map<string, Player> = new Map<string, Player>();

    constructor(UID: SandboxUID)
    {
        super();

        this.sandboxUID = UID;

        this.loadingSandbox = new LoadingSandbox(UID, this);

        this.loadingSandbox.promise
        .then((serverSandbox: ServerSandbox) =>
        {
            this.serverSandbox = serverSandbox;
            // @TODO devrait vérifier si OK mais t'façon le code est bon à jeter
            this.socketManager = new SocketManager(this);
            this.loadingStatus = "success";
            this.emit("loadingSuccess");
        })
        .catch((err: Error) =>
        {
            this.loadingStatus = "error";
            this.emit("loadingError", err);
        });

        this.loadingPromise = new Promise<void>((resolve, reject) =>
        {
            this.on("loadingSuccess", () => resolve());
            this.on("loadingError", () => reject());
        });
    }

    public get promise(): Promise<void>
    {
        return this.loadingPromise;
    }

    // @TODO utiliser interface thenable pour promiselike
    public then(callback: any): Promise<any>
    {
        return this.promise.then(callback);
    }

    public catch(callback: any): Promise<any>
    {
        return this.promise.catch(callback);
    }

    public get UID(): SandboxUID
    {
        return this.sandboxUID;
    }

    public isSuccessfullyLoaded(): boolean
    {
        return (this.loadingStatus === "success");
    }

    public hasFailedLoading(): boolean
    {
        return (this.loadingStatus === "error");
    }

    // Données publiques auxquelles les clients peuvent accéder
    public get publicData(): RoomPublicData
    {
        if (this.isSuccessfullyLoaded())
        {
            const sandboxPublicData: ServerSandboxPublicData = this.serverSandbox?.publicData!;
            const playersCount = this.players.size;

            const roomPublicData: any = Object.assign({}, sandboxPublicData);
            roomPublicData.playersCount = playersCount;

            return roomPublicData;
        }

        const error = new RoomError(`Can't retrieve publicData on Room #${this.sandboxUID} which isn't successfully loaded`);
        env.logger.error(error.message);
        throw error;
    }

    public onReceiveData(socket: Socket, targetMod: string, data: { targetEvent: string, data: any }): void
    {
        const player = Player.get(socket);

        if (targetMod === "gameplay")
        {
            this.serverSandbox!.onGameplayModReceiveData(player, data.targetEvent, data.data);
        }
        else if (targetMod === "overlay")
        {
            this.serverSandbox!.onOverlayModReceiveData(player, data.targetEvent, data.data);
        }
        else if (targetMod === "environment")
        {
            this.serverSandbox!.onEnvironmentModReceiveData(player, data.targetEvent, data.data);
        }
        else
        {
            env.logger.warning(`Trying to send data to unknow mod ${targetMod}`);
        }
    }

    public sendBroadcast(targetMod: string, data: { targetEvent: string, data: any }): void
    {
        this.socketManager!.sendBroadcast(targetMod, data);
    }

    public sendToPlayer(player: Player, targetMod: string, data: { targetEvent: string, data: any }): void
    {
        player.socket.emit(targetMod, data);
    }

    public onPlayerConnect(player: Player)
    {
        env.logger.info(`New player connected ${player.username}`);
        this.players.set(player.socket.id, player);
        this.sendToPlayer(this.players.get(player.socket.id)!, "category", { targetEvent: "test", data: "test" });
    }

    public onPlayerDisconnect(player: Player, reason: any)
    {
        env.logger.info(`Player disconnected ${player.username} : ${reason}`);
        this.players.delete(player.socket.id);
    }

    // Détermine si un joueur peut se connecter à la room
    // On passe quand même l'objet du joueur
    // @TODO une ptn d'idée serait de permettre d'overrider les classes Player etc dans la config des mods ou de sandbox
    public canHandleNewPlayer(player: Player): boolean
    {
        return (this.players.size < this.serverSandbox!.size);
    }
}