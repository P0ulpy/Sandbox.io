import { EventEmitter } from "events";

import { SandboxUID } from "../UID";
import { LoadingSandbox, ServerSandbox, ServerSandboxPublicData } from "../Sandbox";
import env from "../Environment";

type RoomPublicData = ServerSandboxPublicData;

type RoomLoadingStatus = "loading" | "success" | "error";

export class RoomError extends Error {}

export default class Room extends EventEmitter
{
    private sandboxUID: SandboxUID;
    private loadingSandbox: LoadingSandbox;
    // @TODO pas ouf
    private serverSandbox: ServerSandbox | null = null;
    private loadingStatus: RoomLoadingStatus = "loading";
    private loadingPromise: Promise<void>;

    constructor(UID: SandboxUID)
    {
        super();

        this.sandboxUID = UID;

        this.loadingSandbox = new LoadingSandbox(UID);

        this.loadingSandbox
        .then((serverSandbox: ServerSandbox) =>
        {
            this.loadingStatus = "success";
            this.emit("loadingSuccess");
            this.serverSandbox = serverSandbox;
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
            return this.serverSandbox?.publicData!;
        }
        
        const error = new RoomError(`Can't retrieve publicData on Room #${this.sandboxUID} which isn't successfully loaded`);
        env.logger.error(error.message);
        throw error;
    }
    // @TODO route manager :
    /*
    try {
        room.publicData;
    } catch (e) {
        if (e instanceof RoomError)
        res.status(500).send(e.message); // truc comme ça
        else
        res.status(500).send("Véjier erreur interne");
    }*/
}