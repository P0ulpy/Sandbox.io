import AjaxManager from "./AjaxManager.js";
import ModLoader from "./ModLoader.js";
import ClientMod from "./ClientMod.js";
import Sandbox from "./Sandbox.js";
import URLManager from "./URLManager.js";

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
    constructors: {},
};

SandboxNamespace.constructors.AjaxManager = AjaxManager;
SandboxNamespace.constructors.ModLoader = ModLoader;
SandboxNamespace.constructors.ClientMod = ClientMod;
SandboxNamespace.constructors.URLManager = URLManager;
SandboxNamespace.constructors.Sandbox = Sandbox;

AjaxManager.Namespace = SandboxNamespace;
ModLoader.Namespace = SandboxNamespace;
ClientMod.Namespace = SandboxNamespace;
URLManager.Namespace = SandboxNamespace;
Sandbox.Namespace = SandboxNamespace;

// PAS (ENCORE ?) de LibraryComponent



export default SandboxNamespace;