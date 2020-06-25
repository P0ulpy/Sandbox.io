import { Request, Response } from "express";
import { join } from "path";

import RoutesHandlersContainer, { ExpressHandler } from "./RoutesHandlersContainer";
import env from "../Environment";
import { getSandboxUID } from "../UID";
import { Resource } from "../LoadingMod";


const handlersDefinitions = new RoutesHandlersContainer();

function statusOK(data: any): { status: "OK", data: any }
{
    return { status: "OK", data: data };
}

function statusError(data: any): { status: "KO", data: any }
{
    return { status: "KO", data: data };
}

function createRoom(req: Request, res: Response)
{
    try
    {
        const UID = req.query.UID as string;

        if (typeof UID === "undefined")
        {
            throw new Error("Can't retrieve UID GET param");
        }
        env.roomsManager.create(getSandboxUID(UID));

        // @TODO gère les erreurs immédiates, mais pas celles liées au chargement de la room
        res.send(statusOK(UID));
    }
    catch (error)
    {
        res.status(500).send(statusError(error.message));
    }
}


function getRoomPublicData(req: Request, res: Response)
{
    try
    {
        const UID = req.params.UID;
        const room = env.roomsManager.get(getSandboxUID(UID));

        res.send(statusOK(room.publicData));
    }
    catch (error)
    {
        res.status(500).send(statusError(error.message));
    }
}

function getRoomResource(req: Request, res: Response)
{
    const UID = req.params.UID;
    const modCategory = req.params.modCategory;
    const resourceName = req.params.name;

    try
    {
        const room = env.roomsManager.get(getSandboxUID(UID));
        const modsPublicData = room.publicData.mods;
        let resources: Resource[] | null = null;
        let resourceFile: string | null = null;

        // @TODO pas ouf
        if (modCategory === "overlay")
        {
            resources = modsPublicData.overlay.resources;
        }
        else if (modCategory === "environment")
        {
            resources = modsPublicData.environment.resources;
        }
        else if (modCategory === "gameplay")
        {
            resources = modsPublicData.gameplay.resources;
        }
        else
        {
            throw new Error(`Unknown mod category ${modCategory}`);
        }

        // On cherche la ressource
        for (const res of resources)
        {
            if (res.name === resourceName)
            {
                resourceFile = res.filename;
                break;
            }
        }

        if (!resourceFile)
        {
            throw new Error(`Can't find resource ${resourceName} of ${modCategory} mod in #${UID} room`);
        }
        
        const resourcePath = join(env.modPath, modCategory, UID, "resources", resourceFile);

        // Envoi du fichier, et vérification d'une éventuelle erreur
        res.sendFile(resourcePath, (err) =>
        {
            if (err)
            {
                env.logger.error(`Can't find resource file : ${err.message}`);
                res.status(500).send(statusError("Can't find resource file"));
            }
        });
    }
    catch (error)
    {
        res.status(500).send(statusError(error.message));
    }
}

handlersDefinitions.set("createRoom", createRoom)
.set("getRoomPublicData", getRoomPublicData)
.set("getRoomResource", getRoomResource);

export default handlersDefinitions;