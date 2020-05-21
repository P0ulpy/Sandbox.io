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
const Sandbox = require("./Sandbox");

const ModLoader = require("./ModLoader");
const RoomLoader = require("./RoomLoader");
const ModParser = require("./ModParser");
const SocketManager = require("./SocketManager");
const UIDManager = require("./UIDManager");
const LibraryComponent = require("./LibraryComponent");
const RoomsManager = require("./RoomsManager");
const Room = require("./Room");
const HTTPManager = require("./HTTPManager");
const SandboxLoader = require("./SandboxLoader");

const ModInterface = require("./ModInterface");
const ModInterfaceContainer = require("./ModInterfaceContainer");
const ModServer = require("./ModServer");

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
            return this.data.set(key, value);
        },
        get(key)
        {
            return this.data.get(key);
        }
    },
    constructors: {}
};

LibraryComponent.Namespace = SandboxNamespace;

SandboxNamespace.constructors.Sandbox = Sandbox;
SandboxNamespace.constructors.ModLoader = ModLoader;
SandboxNamespace.constructors.RoomLoader = RoomLoader;
SandboxNamespace.constructors.ModParser = ModParser;
SandboxNamespace.constructors.SocketManager = SocketManager;
SandboxNamespace.constructors.UIDManager = UIDManager;
SandboxNamespace.constructors.RoomsManager = RoomsManager;
SandboxNamespace.constructors.Room = Room;
SandboxNamespace.constructors.HTTPManager = HTTPManager;
SandboxNamespace.constructors.SandboxLoader = SandboxLoader;
SandboxNamespace.constructors.ModInterface = ModInterface;
SandboxNamespace.constructors.ModInterfaceContainer = ModInterfaceContainer;
SandboxNamespace.constructors.ModServer = ModServer;

module.exports = SandboxNamespace;