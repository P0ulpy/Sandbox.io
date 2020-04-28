class AjaxMethod
{
    constructor(config)
    {
        this.HTTPMethod = config.HTTPMethod?.toUpperCase() || "GET";

        this.URL = new URL(config.URL);

        for (const [ param, value ] of Object.entries(config.searchParams))
        {
            this.URL.searchParams.set(param, value);
        }

        if (this.HTTPMethod === "POST")
        {
            this.body = new FormData();
            for (const [ param, value ] of Object.entries(config.body))
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
        this.currentXHR?.abort();
    }

    execute()
    {
        this.abort();

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

            XHR.addEventListener("abort", () =>
            {
                reject("Aborted");
            });

            XHR.open(this.HTTPMethod, this.URL.toString());
            XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

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

    execute(name)
    {
        return this.methods.get(name)?.execute();
    }
}

export default AjaxManager;