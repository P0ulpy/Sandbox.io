class UIDGenerator
{
    constructor(nextValueCallback, defaultValues = {})
    {
        this.nextValue = nextValueCallback;

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
}

module.exports = UIDGenerator;