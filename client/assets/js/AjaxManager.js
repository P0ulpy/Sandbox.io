import AjaxMethod from "./AjaxMethod.js";

class AjaxManager
{
    constructor()
    {
        this.methods = new Map();
    }

    create(name, config)
    {
        this.methods.set(name, new AjaxMethod(config));
        return this;
    }

    execute(name, linkParams)
    {
        return this.methods.get(name)?.execute(linkParams);
    }
}

export default AjaxManager;