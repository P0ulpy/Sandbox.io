import { Request, Response } from "express";
import { join } from "path";

import RoutesHandlersContainer, { ExpressHandler } from "./RoutesHandlersContainer";
import env from "../Environment";
import { getSandboxUID, getModUID } from "../UID";
import { Resource, LoadingOverlayMod, LoadingEnvironmentMod, LoadingGameplayMod } from "../LoadingMod";
import { ServerMod } from "../ServerMod";


const handlersDefinitions = new RoutesHandlersContainer();

function statusOK(data: any): { status: "OK", data: any }
{
    return { status: "OK", data: data };
}

function statusError(data: any): { status: "KO", data: any }
{
    return { status: "KO", data: data };
}

function createRoom(req: Request, res: Response): void
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


function getRoomPublicData(req: Request, res: Response): void
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

async function getModResource(req: Request, res: Response)
{
    const modUID = req.params.UID;
    const modCategory = req.params.modCategory;
    const resourceName = req.params.resourceName;

    try
    {
        let resources: Resource[] | null = null;
        let resourceFile: string | null = null;
        let mod: ServerMod | null = null;

        // @TODO pas du tout opti, mais flemme de modifier la classe LoadingMod
        if (modCategory === "overlay")
        {
            mod = await new LoadingOverlayMod(getModUID(modUID)).promise;
        }
        else if (modCategory === "environment")
        {
            mod = await new LoadingEnvironmentMod(getModUID(modUID)).promise;
        }
        else if (modCategory === "gameplay")
        {
            mod = await new LoadingGameplayMod(getModUID(modUID)).promise;
        }
        else
        {
            throw new Error(`Unknown mod category ${modCategory}`);
        }

        resources = mod.publicData.resources; 

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
            throw new Error(`Can't find resource ${resourceName} of ${modCategory} mod in #${modUID} room`);
        }
        
        const resourcePath = join(env.modPath, modCategory, modUID, "resources", resourceFile);

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

function getModClientClass(req: Request, res: Response): void
{
    const UID = req.params.UID;
    const modCategory = req.params.modCategory;

    try
    {
        if (modCategory !== "gameplay" && modCategory !== "overlay" && modCategory !== "environment")
        {
            throw new Error(`Unknown mod category \`${modCategory}\``);
        }
        if (!getModUID(UID).isValid())
        {
            throw new Error(`Invalid Mod UID ${UID}`);
        }

        const clientClassPath = join(env.modPath, modCategory, UID, "client.js");

        // Envoi du fichier, et vérification d'une éventuelle erreur
        res.sendFile(clientClassPath, (err) =>
        {
            if (err)
            {
                env.logger.error(`Can't find clientClass file : ${err.message}`);
                res.status(500).send(statusError("Can't find clientClass file"));
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
.set("getModResource", getModResource)
.set("getModClientClass", getModClientClass);

export default handlersDefinitions;