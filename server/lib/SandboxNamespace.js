const LibraryComponent = require("./LibraryComponent");

const constructors = 
{
    Sandbox: "./Sandbox",
    ServerMod: "./ServerMod",
    ModLoader: "./ModLoader",
    RoomLoader: "./RoomLoader",
    ModParser: "./ModParser",
    SocketManager: "./SocketManager",
    UIDManager: "./UIDManager",
    RoomsManager: "./RoomsManager",
    Room: "./Room",
    HTTPManager: "./HTTPManager",
};

const SandboxNamespace = 
{
    env:
    {
        data: new Map(),
        has(key)
        {
            return this.data.has(key);
        },
        set(key, value)
        {
            this.data.set(key, value);
            return this;
        },
        get(key)
        {
            return this.data.get(key);
        }
    },
    constructors: {}
};

for(constructor in constructors)
{
    SandboxNamespace.constructors[constructor] = require(constructors[constructor]);    
}

LibraryComponent.Namespace = SandboxNamespace;

module.exports = SandboxNamespace;