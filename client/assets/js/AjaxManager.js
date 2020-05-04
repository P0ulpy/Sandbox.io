// Si trop le bordel : classe DynamicAjaxMethod en +
class AjaxMethod
{
    constructor(config = {})
    {
        this.config = config;

        this.HTTPMethod = this.config.HTTPMethod?.toUpperCase() ?? "GET";
        this.contentType = this.config.contentType ?? "application/x-www-form-urlencoded";

        this.searchParams = this.config.searchParams ?? {};
        this.body = this.config.body ?? {};
    }

    computeURL(params = {})
    {
        // Si config.URL est une chaîne, alors on la prend telle quelle
        // exemple : https://www.google.com/blabla?a=holala#bonjour

        // Si config.URL est un objet, alors il est composé en mode :
        // { base: "http://localhost", link: "/_a_", linkParams: [ "a" ] }
        // Bien sûr, chaque élément à ces valeurs par défaut.
        // Les linkParams servent à ne pas recréer d'objet AjaxMethod pour chaque élément, genre
        // /mod/1, /mod/2 ...
        // Ce sera un simple replace de chaîne pour l'instant mais c'est suffisant
        // Ces paramètres seront passés lors de l'exécution (execute())

        if (typeof this.config.URL === "string")
        {
            this.URL = new URL(this.config.URL);
        }
        else
        {
            // Paramètres par défaut
            const base = this.config.URL.base ?? window.location;
            const linkParams = this.config.URL.linkParams ?? [];
            let link = this.config.URL.link ?? "/";

            // On remplate les paramètres du lien : aucunes vérifications, balacouille
            linkParams.forEach((paramName) =>
            {
                if (typeof params[paramName] === "undefined")
                {
                    // Ne devrait pas arriver si bien utilisé
                    throw new Error(`Missing link parameter ${paramName}`);
                }
                link = link.replace(`_${paramName}_`, params[paramName].toString());
            });

            this.URL = new URL(link, base);
        }
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
        console.log("ici");
        this.currentXHR?.abort();
    }

    execute(linkParams = {})
    {
        //this.abort();

        this.computeURL(linkParams);
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