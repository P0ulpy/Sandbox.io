const path = require("path");
const fs = require("fs");
const LibraryComponent = require("./LibraryComponent");

class SandboxLoader extends LibraryComponent
{
    constructor()
    {
        super()
    }

    getAbsolutePath(modFolder)
    {
        return path.join(this.env.get("sandboxPath"), modFolder);
    }

    instanciateFromFolder(sandboxFolder)
    {
        const absolutePath = this.getAbsolutePath(sandboxFolder);

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
                    const sandboxFile = path.join(absolutePath, sandboxConfig.server);

                    if (this.env.get("UIDManager").get("sandbox").isValid(sandboxConfig.uniqueID))
                    {
                        sandboxConfig.sandboxPath = absolutePath;

                        resolve(new (require(sandboxFile))(sandboxConfig));
                    }
                    else reject(new Error("Invalid Sandbox ID"))
                }
            });
        });
    }
}

module.exports = SandboxLoader;