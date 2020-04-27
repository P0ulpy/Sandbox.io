const Sandbox = require("./Sandbox");
const ServerMod = require("./ServerMod");
const ModLoader = require("./ModLoader");
const RoomLoader = require("./RoomLoader");
const ModParser = require("./ModParser");
const SocketManager = require("./SocketManager");
const UIDManager = require("./UIDManager");
const LibraryComponent = require("./LibraryComponent");
const RoomsManager = require("./RoomsManager");
const Room = require("./Room");
const AjaxManager = require("./AjaxManager");

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

SandboxNamespace.constructors.Sandbox = Sandbox;
SandboxNamespace.constructors.ServerMod = ServerMod;
SandboxNamespace.constructors.ModLoader = ModLoader;
SandboxNamespace.constructors.RoomLoader = RoomLoader;
SandboxNamespace.constructors.ModParser = ModParser;
SandboxNamespace.constructors.SocketManager = SocketManager;
SandboxNamespace.constructors.UIDManager = UIDManager;
SandboxNamespace.constructors.RoomsManager = RoomsManager;
SandboxNamespace.constructors.Room = Room;
SandboxNamespace.constructors.AjaxManager = AjaxManager;

module.exports = SandboxNamespace;