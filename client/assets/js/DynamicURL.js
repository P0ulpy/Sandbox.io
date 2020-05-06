class DynamicURL
{
    constructor(config = {})
    {
        // Paramètres par défaut
        this.base = config.base ?? window.location;
        this.linkParams = config.linkParams ?? [];
        this.link = config.link ?? "/";
    }

    // Si config.URL est un objet, alors il est composé en mode :
    // { base: "http://localhost", link: "/_a_", linkParams: [ "a" ] }
    // Bien sûr, chaque élément à ces valeurs par défaut.
    // Les linkParams servent à ne pas recréer d'objet AjaxMethod pour chaque élément, genre
    // /mod/1, /mod/2 ...
    // Ce sera un simple replace de chaîne pour l'instant mais c'est suffisant
    // Ces paramètres seront passés lors de l'exécution (execute())
    compute(params = {})
    {
        let finalLink = this.link;

        // On remplace les paramètres du lien : aucunes vérifications, balacouille
        this.linkParams.forEach((paramName) =>
        {
            if (typeof params[paramName] === "undefined")
            {
                // Ne devrait pas arriver si bien utilisé
                throw new Error(`Missing link parameter ${paramName}`);
            }
            finalLink = finalLink.replace(`_${paramName}_`, params[paramName].toString());
        });

        return new URL(finalLink, this.base);
    }
}

export default DynamicURL;