const Sandbox = require("./Sandbox");
const ServerMod = require("./ServerMod");
const ModParser = require("./ModParser");
const SocketManager = require("./SocketManager");
const SandboxContainer = require("./SandboxContainer");
const UIDManager = require("./UIDManager");
const LibraryComponent = require("./LibraryComponent");

const SandboxNamespace =
{
    globals:
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

/*const LibraryComponent = require("./LibraryComponent");
SandboxNamespace.LibraryComponent = LibraryComponent;
LibraryComponent.Namespace = SandboxNamespace;*/

/* Lorsque les classes hériteront de LibraryComponent, il faudra juste alimenter
SandboxNamespace, on aura plus besoin d'assigner le namespace à chaque component
car il sera récupéré depuis LibraryComponent :
// PLUS DE :
SandboxNamespace.SocketManager = SocketManager;
SocketManager.Namespace = SandboxNamespace;
// MAIS PLUTOT :
SandboxNamespace.SocketManager = SocketManager;
*/

LibraryComponent.Namespace = SandboxNamespace;

SandboxNamespace.constructors.Sandbox = Sandbox;
Sandbox.Namespace = SandboxNamespace;

SandboxNamespace.constructors.ServerMod = ServerMod;
ServerMod.Namespace = SandboxNamespace;

SandboxNamespace.constructors.ModParser = ModParser;
ModParser.Namespace = SandboxNamespace;

SandboxNamespace.constructors.SocketManager = SocketManager;

SandboxNamespace.constructors.SandboxContainer = SandboxContainer;
SandboxContainer.Namespace = SandboxNamespace;

SandboxNamespace.constructors.UIDManager = UIDManager;

module.exports = SandboxNamespace;