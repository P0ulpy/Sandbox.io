const path = require("path");
const fs = require("fs");
const LibraryComponent = require("./LibraryComponent");

class SandboxContainer extends LibraryComponent
{
    constructor()
    {
        super();
        this.sandboxes = new Map();
    }

    add(sandbox)
    {
        this.sandboxes.set(sandbox.uniqueID, sandbox);
        return this;
    }

    get(uniqueID)
    {
        return this.sandboxes.get(uniqueID);
    }

    forEach(callback)
    {
        this.sandboxes.forEach((sandbox, uniqueID) => callback(sandbox, uniqueID));
    }

    instanciateFromFolder(sandboxFolder)
    {
        const absolutePath = path.join(this.globals.get("sandboxPath"), sandboxFolder);

        return new Promise((resolve, reject) =>
        {
            this.debug("note", `Parsing ${absolutePath} sandbox directory...`)
            const sandboxConfigPath = path.join(absolutePath, "sandboxconfig.json");

            /*
                Toutes les opérations I/O doivent être asynchrones pour des raisons de performances.
                Il faut donc utiliser des fonctions asynchrones chaque fois que possible.
            */
            fs.readFile(sandboxConfigPath, "utf-8", (err, data) =>
            {
                if (err) reject(err);
                else
                {
                    const sandboxConfig = JSON.parse(data);
                    const sandboxFile = path.join(absolutePath, sandboxConfig.server || "server");

                    sandboxConfig.sandboxPath = absolutePath;

                    resolve(new (require(sandboxFile))(sandboxConfig));
                }
            });
        });
    }
}

module.exports = SandboxContainer;