import { Socket } from "socket.io";

export interface IPlayerConfig {
    socket: Socket;
}

export default class Player
{
    // string : socket.id
    private static readonly players: Map<string, Player> = new Map<string, Player>();

    // @TODO balec j'met tout en public c'est bon y'en a marre là
    public position: { x: number, y: number } = { x: 200, y: 200 };
    public username: string = "default";
    public socket: Socket;
    public customData: Map<string, any> = new Map<string, any>();

    constructor(config: IPlayerConfig)
    {
        this.socket = config.socket;
    }

    static get(socket: Socket): Player
    {
        if (!this.players.has(socket.id))
        {
            // @TODO nul nul nul
            this.players.set(socket.id, new Player({ socket }));
        }
        return this.players.get(socket.id)!;
    }

    public getCustomData(key: string): any
    {
        return this.customData.get(key);
    }

    public setCustomData(key: string, data: any): this
    {
        this.customData.set(key, data);
        return this;
    }
}