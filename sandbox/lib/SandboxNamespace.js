const Sandbox = require("./Sandbox");
const ServerMod = require("./ServerMod");
const ModLoader = require("./ModLoader");
const SandboxLoader = require("./SandboxLoader");
const ModParser = require("./ModParser");
const SocketManager = require("./SocketManager");
const SandboxContainer = require("./SandboxContainer");
const UIDManager = require("./UIDManager");
const LibraryComponent = require("./LibraryComponent");

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
SandboxNamespace.constructors.ServerMod = ServerMod;
SandboxNamespace.constructors.ModLoader = ModLoader;
SandboxNamespace.constructors.SandboxLoader = SandboxLoader;
SandboxNamespace.constructors.ModParser = ModParser;
SandboxNamespace.constructors.SocketManager = SocketManager;
SandboxNamespace.constructors.SandboxContainer = SandboxContainer;
SandboxNamespace.constructors.UIDManager = UIDManager;

module.exports = SandboxNamespace;