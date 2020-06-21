import LibraryComponent from "../LibraryComponent";
import Sandbox from "../Sandbox";
import { SandboxUID } from "../UID";
import SocketManager from "../SocketManager";
import { SandboxInterface } from "../ElementInterface";

/* Une Room est avant la Sandbox : on se connecte à une Room, on a un chat de Room, le message de
la Room (MODT), l'icone de la Room, éventuellement une interface pour les équipes etc...
Puis dès que le jeu commence, la Sandbox associée est démarrée (roomID = SandboxID) et tous les
clients de la Room se connectent à la Sandbox

La Room a besoin de la Sandbox pour fonctionner, puisque c'est la Sandbox qui détermine l'UID,
mais aussi le nombre de joueurs max, les mods installés...
On crée donc une Room depuis une Sandbox : Sandbox.createRoom()
*/

// Une room dépend de sa sandbox. Pour créer une room, on lui passe l'UID de la Sandbox,
// et il va l'instancier

export default class Room extends LibraryComponent
{
    public sandbox: Sandbox;

    constructor(UID: SandboxUID)
    {
        super();

        // Instanciation de SandboxInterface(), qui va permettre ensuite d'instancier la
        // Sandbox et ses mods

        const sandboxInterface = new SandboxInterface(UID);

        sandboxInterface.loadingPromise
        .then()

        this.sandbox = sandbox;
    }

    get name(): string
    {
        return this.sandbox.name;
    }

    get UID(): SandboxUID
    {
        return this.sandbox.UID;
    }

    get MOTD(): string
    {
        return this.sandbox.MOTD;
    }

    get size(): number
    {
        return this.sandbox.size;
    }

    private get socketManager(): SocketManager
    {
        return this.sandbox.socketManager;
    }

    get clientsCount(): number
    {
        return this.socketManager.clientsCount;
    }

    get data()
    {
        return {
            name: this.name,
            size: this.size,
            clientsCount: this.clientsCount,
            MOTD: this.MOTD,
            UID: this.UID
        };
    }
}

module.exports = Room;