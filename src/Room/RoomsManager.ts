import { SandboxUID } from "../UID";
import Room from "./Room";
import env from "../Environment";
import { EventEmitter } from "events";

class RoomsManagerError extends Error {}

export default class RoomsManager extends EventEmitter
{
    private rooms: Map<SandboxUID, Room> = new Map<SandboxUID, Room>();

    constructor()
    {
        super();
    }

    public has(UID: SandboxUID): boolean
    {
        return this.rooms.has(UID);
    }

    public get(UID: SandboxUID): Room
    {
        if (!this.has(UID))
        {
            const error = new RoomsManagerError(`Trying to access inexistent Room ${UID}`);
            env.logger.error(error.message);
            throw error;
        }

        return this.rooms.get(UID)!;
    }

    public create(UID: SandboxUID): this
    {
        if (this.has(UID))
        {
            const error = new RoomsManagerError(`Can't recreate Room ${UID} which already exists`);
            env.logger.error(error.message);
            throw error;
        }
        else
        {
            const newRoom = new Room(UID);

            newRoom.on("loadingSuccess", () =>
            {
                env.logger.info(`Room #${UID} ready to use`);
                this.emit("roomLoaded", newRoom);
            })
            .on("loadingError", (error) =>
            {
                env.logger.error(`Error while loading Room #${UID} : ${error.message}`);
                this.emit("roomError", newRoom, error)
            });

            this.rooms.set(UID, newRoom);
        }
        return this;
    }
}