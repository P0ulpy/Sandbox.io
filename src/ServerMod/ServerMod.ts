import { EventEmitter } from "events";

export default abstract class ServerMod extends EventEmitter
{
    constructor()
    {
        super();

        console.log(`Hello from ${this.constructor.name}`);
    }
}