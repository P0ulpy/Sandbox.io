const LibraryComponent = require("./LibraryComponent");

/*const Sandbox = require("./Sandbox");
const ServerMod = require("./ServerMod");
const ModLoader = require("./ModLoader");
const RoomLoader = require("./RoomLoader");
const ModParser = require("./ModParser");
const SocketManager = require("./SocketManager");
const UIDManager = require("./UIDManager");
const RoomsManager = require("./RoomsManager");
const Room = require("./Room");
const HTTPManager = require("./HTTPManager");*/

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
}

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

LibraryComponent.Namespace = SandboxNamespace;

/*
SandboxNamespace.constructors.Sandbox = Sandbox;
SandboxNamespace.constructors.ServerMod = ServerMod;
SandboxNamespace.constructors.ModLoader = ModLoader;
SandboxNamespace.constructors.RoomLoader = RoomLoader;
SandboxNamespace.constructors.ModParser = ModParser;
SandboxNamespace.constructors.SocketManager = SocketManager;
SandboxNamespace.constructors.UIDManager = UIDManager;
SandboxNamespace.constructors.RoomsManager = RoomsManager;
SandboxNamespace.constructors.Room = Room;
SandboxNamespace.constructors.HTTPManager = HTTPManager;
*/

for(constructor in constructors)
{
    SandboxNamespace.constructors[constructor] = require(constructors[constructor]);    
}

module.exports = SandboxNamespace;