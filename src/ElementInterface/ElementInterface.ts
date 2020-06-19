import LibraryComponent from "../LibraryComponent";
import { UID } from "../UID";
import { SandboxInterface } from ".";


export type LoadingStatus = "not started" | "in progress" | "success" | "error";

export default abstract class ElementInterface extends LibraryComponent
{
    public loadingStatus: LoadingStatus = "not started";
    public error?: Error;
    public abstract UID: UID;
    public loadingPromise: Promise<this>;

    constructor()
    {
        super();

        /* Retourne une promesse qui est résolue lorsque le statut vaut "success", sinon elle est rejetée */
        this.loadingPromise = new Promise<this>((resolve, reject) => {
            if (this.hasSucceeded())
            {
                resolve(this);
            }
            else if (this.hasFailed())
            {
                reject(this.error);
            }
            else
            {
                this.on("loadSuccess", () => resolve(this));
                this.on("loadError", err => reject(err));
            }
        });

        this.loadingPromise.catch((err) => this.debug("error", `Error in ElementInterface #${this.UID} : ${err}`));
    }

    endWithError(err: Error)
    {
        this.changeStatus("error");
        this.error = err;
        this.emit("loadError", err);
        this.debug("error", `Error while loading ${this.constructor.name} #${this.UID} : `, err.message);
    }

    changeStatus(newStatus: LoadingStatus): void
    {
        this.loadingStatus = newStatus;
        this.emit("statusChange", newStatus);
        if (newStatus === "success")
        {
            this.debug("log", `Loading ${this.constructor.name} #${this.UID} successful`);
        }
    }

    protected startLoading(): void
    {
        // @TODO eventuellemet, typer les noms d'event
        this.debug("note", `Début de chargement du ${this.constructor.name} #${this.UID}.`);

        // Le chargement d'UN élément a rencontré une erreur : on termine sur une erreur
        this.on("elementLoadError", err => this.endWithError(err));

        // Le chargement d'UN élément s'est effectué avec succès
        this.on("elementLoadSuccess", () => this.checkLoadSuccess());

        this.changeStatus("in progress");
    }

    abstract checkLoadSuccess(): void;

    /* Obtenir des informations sur le statut en cours */

    isFinished(): boolean
    {
        return (this.hasSucceeded() || this.hasFailed());
    }

    hasFailed(): boolean
    {
        return (this.loadingStatus === "error");
    }

    hasSucceeded(): boolean
    {
        return (this.loadingStatus === "success");
    }
}