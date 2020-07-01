import { Socket, Namespace, Packet } from "socket.io";

import env from "../Environment";
import { Room } from "../Room";
import Player from "../Room/Player";

export default class SocketManager
{
    private namespaceIO: Namespace;
    private room: Room;

    constructor(room: Room)
    {
        this.room = room;
        this.namespaceIO = env.socketServer.of(`/${this.room.UID}`);

        this.initSocket();
    }

    // Initialisation de l'écoute de connexions via Socket.io
    private initSocket(): void
    {
        this.namespaceIO.on("connection", (socket: Socket) =>
        {
            const player = Player.get(socket);

            if (this.room.canHandleNewPlayer(player))
            {
                this.room.onPlayerConnect(player);
                socket.on("disconnect", (reason) =>
                {
                    this.room.onPlayerDisconnect(player, reason);
                });

                socket.use((packet: Packet, next) =>
                {
                    // event : mod de destination : "gameplay", "overlay" ou "environment"
                    // data: { event: "mod développeur", data: data }
                    const event = packet[0], data = packet[1];

                    this.room.onReceiveData(socket, event, { targetEvent: data.targetEvent, data: data.data });

                    next();
                });
            }
            else
            {
                env.logger.info(`Auto disconnecting ${socket.id}`);
                socket.disconnect();
            }
        });
    }

    public sendBroadcast(targetMod: string, data: { targetEvent: string, data: any }): void
    {
        this.namespaceIO.emit(targetMod, data);
    }
}