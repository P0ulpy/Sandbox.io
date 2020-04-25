const Sandbox = require("./Sandbox");
const ServerMod = require("./ServerMod");
const ModParser = require("./ModParser");
const SocketManager = require("./SocketManager");
const SandboxContainer = require("./SandboxContainer");
const UIDManager = require("./UIDManager");

const SandboxNamespace =
{
    globals: new Map(),
    hasGlobal(key)
    {
        return this.globals.has(key);
    },
    setGlobal(key, value)
    {
        return this.globals.set(key, value);
    },
    getGlobal(key)
    {
        return this.globals.get(key);
    }
};

SandboxNamespace.Sandbox = Sandbox;
Sandbox.Namespace = SandboxNamespace;

SandboxNamespace.ServerMod = ServerMod;
ServerMod.Namespace = SandboxNamespace;

SandboxNamespace.ModParser = ModParser;
ModParser.Namespace = SandboxNamespace;

SandboxNamespace.SocketManager = SocketManager;
SocketManager.Namespace = SandboxNamespace;

SandboxNamespace.SandboxContainer = SandboxContainer;
SandboxContainer.Namespace = SandboxNamespace;

SandboxNamespace.UIDManager = UIDManager;
UIDManager.Namespace = SandboxNamespace;

module.exports = SandboxNamespace;