import LibraryComponent from "../LibraryComponent";
import { ModUID } from "../UID";
import ModServer from "./ModServer";

export default class ModsCollection extends LibraryComponent
{
    public mods: Map<ModUID, ModServer> = new Map<ModUID, ModServer>();

    constructor()
    {
        super();
    }

    get length(): number
    {
        return this.mods.size;
    }

    add(mod: ModServer): this
    {
        this.mods.set(mod.UID, mod);

        return this;
    }

    forEach(callback: (UID: ModUID, modServer: ModServer) => void): void
    {
        for (const [ UID, modServer ] of this.mods.entries())
        {
            callback(UID, modServer);
        }
    }

    to(...targetsIDs)
    {
        const filteredCollection = new ModsCollection();

        this.mods.forEach((mod, UID) =>
        {
            if (targetsIDs.includes(UID))
            {
                filteredCollection.add(mod);
            }
        });

        return filteredCollection;
    }

    emit(event, data)
    {
        this.mods.forEach(mod => mod.emit(event, data));
    }
}