import SandboxNamespace from "./SandboxNamespace.js";

class AjaxMethod
{
    constructor(config = {})
    {
        this.HTTPMethod = config.HTTPMethod?.toUpperCase() ?? "GET";
        this.contentType = config.contentType ?? "application/x-www-form-urlencoded";

        this.searchParams = config.searchParams ?? {};
        this.body = config.body ?? {};

        this.autoAbort = config.autoAbort ?? false;

        // Si config.URL est une chaîne, alors on la prend telle quelle
        // exemple : https://www.google.com/blabla?a=holala#bonjour
        if (typeof config.URL === "string")
        {
            this.URL = new URL(config.URL);
        }
        // Sinon, c'est un objet du type :
        // { base: "http://localhost", link: "/_a_", linkParams: [ "a" ] }
        // et on fait appel au module URLGenerator pour le transformer en chaîne
        else
        {
            this.computeURL(config.URL);

            if (this.autoAbort)
            {
                console.warn("Attention, utiliser autoAbort avec une URL dynamique peut annuler des requêtes de manière pas ouf");
            }
        }
    }

    computeURL(URLconfig)
    {
        this.dynamicURL = new SandboxNamespace.constructors.DynamicURL(URLconfig);
    }

    setSearchParams()
    {
        for (const [ param, value ] of Object.entries(this.searchParams))
        {
            this.URL.searchParams.set(param, value);
        }
    }

    setBody()
    {
        if (this.HTTPMethod === "POST")
        {
            this.body = new FormData();
            for (const [ param, value ] of Object.entries(this.body))
            {
                this.body.append(param, value);
            }
        }
        else
        {
            this.body = null;
        }
    }

    abort()
    {
        if (this.autoAbort) this.currentXHR?.abort();
    }

    execute(linkParams = {})
    {
        this.abort();

        if (this.dynamicURL)
        {
            this.URL = this.dynamicURL.compute(linkParams);
        }

        this.setSearchParams();
        this.setBody();

        return new Promise((resolve, reject) =>
        {
            const XHR = new XMLHttpRequest();

            XHR.addEventListener("readystatechange", () =>
            {
                if (XHR.readyState === XMLHttpRequest.DONE)
                {
                    if (XHR.status === 200)
                    {
                        resolve(XHR.responseText);
                    }
                    else if (XHR.status !== 0)
                    {
                        reject(`[${XHR.status}] ${XHR.statusText}`);
                    }
                }
            });

            XHR.addEventListener("abort", () => reject("Aborted"));

            XHR.open(this.HTTPMethod, this.URL.toString());
            XHR.setRequestHeader("Content-Type", this.contentType);

            XHR.send(this.body);

            this.currentXHR = XHR;
        });
    }
}

export default AjaxMethod;