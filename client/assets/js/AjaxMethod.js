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

        if (typeof config.URLkey !== "string")
        {
            throw new Error(`[AjaxMethod] : config.URLkey must be a string`);
        }
        this.URLkey = config.URLkey;
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
        this.currentXHR?.abort();
    }

    execute(linkParams)
    {
        if (this.autoAbort) this.abort();

        this.URL = SandboxNamespace.env.get("URLManager").computeAsURL(this.URLkey, linkParams);

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