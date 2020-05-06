import SandboxNamespace from "./SandboxNamespace.js";

class AjaxManager
{
    constructor()
    {
        this.methods = new Map();
    }

    create(name, config)
    {
        this.methods.set(name, new SandboxNamespace.constructors.AjaxMethod(config));
        return this;
    }

    execute(name, linkParams)
    {
        return this.methods.get(name)?.execute(linkParams);
    }
}

export default AjaxManager;