import socket from "socket.io";

import LibraryComponent from "../LibraryComponent";
import { Room } from "../Room";
import env from "../Environment";
import Sandbox from "../Sandbox";

/* Puisqu'il va falloir gérer un objet Room et un Sandbox via un seul et unique SocketManager,
on émet des évènements qui seront traités différemment selon qu'on est encore « en mode room »
ou qu'on est en « mode sandbox »
Cet objet SocketManager sera partagé entre Room et Sandbox !!!
*/

// Ici seront gérées toutes les données qui transitent entre les clients et le serveur
export default class SocketManager extends LibraryComponent
{
    public room: Room;
    public clients: Map<string, socket.Socket> = new Map<string, socket.Socket>();
    public io: socket.Namespace;
    public sandbox: Sandbox;

    constructor(room: Room)
    {
        super();

        this.room = room;

        this.sandbox = room.sandbox;

        this.io = env.socketServer.of(`/${this.room.UID}`);
    }

    get clientsCount()
    {
        return this.clients.size;
    }

    init()
    {
        this.initJoin();
        //this.initModsListener();
        //this.initModsSendProtocol();
    }

    initJoin()
    {
        this.io.on("connection", socket =>
        {
            this.emit("socketConnected", socket);
            this.clients.set(socket.id, socket);

            socket.on("disconnect", (reason) =>
            {
                this.emit("socketDisconnected", socket, reason);
                this.clients.delete(socket.id);
            });
        });
    }

    initModsListener()
    {
        this.sandbox.mods.forEach((mod, UID) =>
        {
            this.debug("note", `Mod ${UID} ready to listen for data...`)
            // 1 namespace par sandbox
            this.io.on("connection", (socket) =>
            {
                this.debug("log", `Socket ${socket.id} connected to mod ${UID}`);

                /* Middleware à partir duquel on va récupérer tous les paquets entrants associés à ce mod,
                puis on va envoyer les informations à ce mod. Le mod n'interagit donc pas directement avec
                les données qui circulent. */
                socket.use((packet, next) =>
                {
                    const event = packet[0], data = packet[1];

                    /* L'évènement "receiveData" est réservé à la réception de données pour les mods */
                    mod.emit("receiveData", event, data);

                    next();
                });
            });
        });
    }

    /*initModsSendProtocol()
    {
        this.sandbox.loadedMods.forEach((mod, UID) =>
        {
            this.debug("note", `Mod ${UID} ready to send data...`);
            // L'évènement "sendData" est réservé à l'envoi de données pour les mods
            mod.on("sendData", (event, data) =>
            {
                this.io.emit(event, data);
            });
        });
    }*/
}