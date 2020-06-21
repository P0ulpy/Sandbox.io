import LibraryComponent from "../LibraryComponent";
import { ModUID, SandboxUID } from "../UID";
import SocketManager from "../SocketManager";
import { ModsCollection } from "../Mod";

export type SandboxConfig = {
    // Fréquence de rafraichissement : appel à update()
    updateRate?: number;
    // Liste des mods à charger
    mods: ModsCollection;
    // UID unique de la Sandbox
    UID: SandboxUID;
    // Chemin vers le dossier de la Sandbox sur le serveur
    sandboxPath: string;
    // Permet de gérer les données entrantes/sortantes vers cette Sandbox
    socketManager: SocketManager;
    // Nom d'affichage de la Sandbox
    name: string;
    // Message d'affichage de la Sandbox
    MOTD?: string;
    // Taille maximale de la Sandbox
    size?: number;
}

export default class Sandbox extends LibraryComponent
{
    public updateRate: number;
    public mods: ModsCollection;
    public UID: SandboxUID;
    public sandboxPath: string;
    public socketManager: SocketManager;
    public name: string;
    public MOTD: string;
    public size: number;

    constructor(sandboxConfig: SandboxConfig)
    {
        super();

        this.updateRate = sandboxConfig.updateRate ?? 30;

        this.mods = sandboxConfig.mods;

        this.UID = sandboxConfig.UID;

        this.sandboxPath = sandboxConfig.sandboxPath;

        this.socketManager = sandboxConfig.socketManager;

        this.name = sandboxConfig.name;

        this.MOTD = sandboxConfig.MOTD ?? "Default MOTD";

        this.size = sandboxConfig.size ?? 5;

        this.debug("log", `Sandbox #${this.UID} instanciée avec ${this.mods.length} mods.`);

        // Données propres à chaque client : espace réservé, ici qu'on va stocker l'instance de Player
        // Chaque client sera désigné par son id de connexion (socket.id) qui est le même peu importe le namespace
    }

    initEvents()
    {
        this.socketManager.on("socketConnected", socket =>
        {
            this.debug("log", `Socket ${socket.id} connected to Sandbox #${this.UID}`);
        });
        this.socketManager.on("socketDisconnected", (socket, reason) =>
        {
            this.debug("log", `Socket ${socket.id} disconnected from #${this.UID} : ${reason}`);
        });
    }

    startUpdateLoop()
    {
        setInterval(() =>
        {
            this.emit("update");
        }, this.updateRate);
    }
}

module.exports = Sandbox;