

class Mod
{
    constructor(name)
    {
        this.name = name;
        this.socket = io.connect(`http://localhost/${name}`);
    }
}

const mods = [];

for (const mod of [ "mod1", "mod2" ])
{
    console.log(mod);
    mods.push(new Mod(mod));
}