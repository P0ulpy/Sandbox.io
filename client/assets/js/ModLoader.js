class ModLoader
{
    constructor()
    {
        
    }

    loadClassFile(URL)
    {
        return import(URL);
    }
}

export default ModLoader;