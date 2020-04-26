class UIDGenerator
{
    constructor(nextValueCallback, validityCallback, defaultValues = {})
    {
        this.nextValue = nextValueCallback;

        this.validityCallback = validityCallback;

        this.staticData = new Map(Object.entries(defaultValues));
    }

    // Rendre la valeur persistante (pas le cas pour l'instant)
    persist(key, value)
    {
        this.staticData.set(key, value);
        return this;
    }

    get(key)
    {
        return this.staticData.get(key);
    }

    nextValue()
    {
        return this.nextValue.call(this);
    }

    isValid(UID)
    {
        return this.validityCallback.call(this, UID);
    }
}

module.exports = UIDGenerator;