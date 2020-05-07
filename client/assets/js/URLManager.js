class URLManager
{
    constructor()
    {
        this.URLs = new Map();
    }

    create(key, URLDescriptor = {})
    {
        if (typeof URLDescriptor === "string")
        {
            this.URLs.set(key, URLDescriptor);
        }
        else if (typeof URLDescriptor === "object")
        {
            this.URLs.set(key, {
                base: URLDescriptor.base ?? window.location,
                linkParams: URLDescriptor.linkParams ?? [],
                link: URLDescriptor.link ?? "/"
            });
        }
        else
        {
            throw new Error("URLDescriptor must be a string or an object");
        }
        return this;
    }

    get(key)
    {
        if (typeof this.URLs.get(key) !== "undefined")
        {
            return this.URLs.get(key);
        }

        throw new Error(`Can't find URL with key ${key}`);
    }

    getRaw(key)
    {
        if (typeof this.get(key) === "string")
        {
            return new URL(this.get(key));
        }
        throw new Error(`URL with key '${key}' is a dynamic URL. Please use computeAsURL() or computeAsString()`);
    }

    // Si config.URL est un objet, alors il est composé en mode :
    // { base: "http://localhost", link: "/_a_", linkParams: [ "a" ] }
    // Bien sûr, chaque élément à ces valeurs par défaut.
    // Les linkParams servent à ne pas recréer d'objet AjaxMethod pour chaque élément, genre
    // /mod/1, /mod/2 ...
    // Ce sera un simple replace de chaîne pour l'instant mais c'est suffisant
    // Ces paramètres seront passés lors de l'exécution (compute())
    compute(key, dynamicParams = {})
    {
        const URLDescriptor = this.get(key);
        let dynamicLink = URLDescriptor.link;

        if (typeof URLDescriptor === "string")
        {
            throw new Error(`URL with key ${key} is static. Please use getRaw()`);
        }

        for (const linkParam of URLDescriptor.linkParams)
        {
            if (typeof dynamicParams[linkParam] === "undefined")
            {
                // Ne devrait pas arriver si bien utilisé
                throw new Error(`Missing link parameter ${linkParam}`);
            }

            dynamicLink = dynamicLink.replace(`_${linkParam}_`, dynamicParams[linkParam].toString());
        }

        return new URL(dynamicLink, URLDescriptor.base);
    }

    // Surcouches à compute() et getRaw() : détermine s'il faut appeler getRaw() ou compute()
    computeAsURL(key, dynamicParams)
    {
        if (typeof dynamicParams === "undefined")
        {
            return this.getRaw(key);
        }
        return this.compute(key, dynamicParams);
    }

    computeAsString(key, dynamicParams)
    {
        if (typeof dynamicParams === "undefined")
        {
            return this.getRaw(key).toString();
        }
        return this.compute(key, dynamicParams).toString();
    }
}

export default URLManager;