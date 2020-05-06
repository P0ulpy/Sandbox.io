import AjaxMethod from "./AjaxMethod.js";
import AjaxManager from "./AjaxManager.js";
import ModLoader from "./ModLoader.js";
import ClientMod from "./ClientMod.js";
import DynamicURL from "./DynamicURL.js";
import Sandbox from "./Sandbox.js";

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

SandboxNamespace.constructors.AjaxMethod = AjaxMethod;
SandboxNamespace.constructors.AjaxManager = AjaxManager;
SandboxNamespace.constructors.ModLoader = ModLoader;
SandboxNamespace.constructors.ClientMod = ClientMod;
SandboxNamespace.constructors.DynamicURL = DynamicURL;
SandboxNamespace.constructors.Sandbox = Sandbox;

AjaxMethod.Namespace = SandboxNamespace;
AjaxManager.Namespace = SandboxNamespace;
ModLoader.Namespace = SandboxNamespace;
ClientMod.Namespace = SandboxNamespace;
DynamicURL.Namespace = SandboxNamespace;
Sandbox.Namespace = SandboxNamespace;

// PAS (ENCORE ?) de LibraryComponent

export default SandboxNamespace;