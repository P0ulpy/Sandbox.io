const UIDGenerator = require("./UIDGenerator");

class UIDManager
{
    constructor()
    {
        this.UIDGenerators = new Map();
    }

    create(name, nextValueCallback, validityCallback, defaultValues)
    {
        this.UIDGenerators.set(name, new UIDGenerator(nextValueCallback, validityCallback, defaultValues));
        return this;
    }

    get(name)
    {
        return this.UIDGenerators.get(name);
    }
}

module.exports = UIDManager;