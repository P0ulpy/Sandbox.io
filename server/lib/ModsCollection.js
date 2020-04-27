const path = require("path");
const fs = require("fs");
const LibraryComponent = require("./LibraryComponent");

class ModsCollection extends LibraryComponent
{
    constructor()
    {
        super();
        this.mods = new Map();
    }

    get length()
    {
        return this.mods.size;
    }

    add(mod)
    {
        this.mods.set(mod.UID, mod);
        return this;
    }

    forEach(callback)
    {
        this.mods.forEach((mod, UID) => callback(mod, UID));
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

module.exports = ModsCollection;