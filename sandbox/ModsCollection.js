class ModsCollection
{
    constructor()
    {
        this.mods = new Map();
    }

    get length()
    {
        return this.mods.size;
    }

    add(mod)
    {
        this.mods.set(mod.uniqueID, mod);
    }

    forEach(callback)
    {
        this.mods.forEach((mod, uniqueID) =>
        {
            callback(mod, uniqueID);
        });
    }

    to(...targetsIDs)
    {
        const filteredCollection = new ModsCollection();

        this.mods.forEach((mod, uniqueID) =>
        {
            if (targetsIDs.includes(uniqueID))
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