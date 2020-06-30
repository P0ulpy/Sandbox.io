import env from "../Environment";

import { join } from 'path';
import { Request, Response } from "express";

import RoutesHandlersContainer from "./RoutesHandlersContainer";
import { getSandboxUID, getModUID } from "../UID";
import { Resource, LoadingOverlayMod, LoadingEnvironmentMod, LoadingGameplayMod } from "../LoadingMod";
import { ServerMod } from "../ServerMod";

function statusOK(data: any): { status: "OK", data: any }
{
    return { status: "OK", data: data };
}

function statusError(data: any): { status: "KO", data: any }
{
    return { status: "KO", data: data };
}

const handlersDefinitions = new RoutesHandlersContainer();

handlersDefinitions

.set('denyNotAuthenticated', (req: Request, res: Response, next: any) => 
{
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        res.status(403).send(statusError({ message: "access forbidden" }));
    }
})

.set('denyAuthenticated', (req: Request, res: Response, next: any) => 
{
    if(req.isAuthenticated())
    {
        res.status(403).send(statusError({ message: "access forbidden" }));
    }
    else
    {
        next();
    }
})

.set('mypanel', (req: any, res: Response) => 
{
    const user = env.passportManager.getUserByID(req.user?.id);

    res.send(statusOK({
        user: user?.publicData,
        mods: [] // TODO : recup tout les mods existants
    }));
})

.set('getRooms', (req: Request, res: Response) => 
{
    try
    {
        res.send(statusOK({ rooms : env.roomsManager.roomsPublicData }));
        env.logger.info(`sucessfuly sent roomsPublicData`);
    }
    catch(err)
    {
        res.status(500).send(statusError({ message: `internal error`}));
        env.logger.error(`error while trying to send roomsPublicData`);
        throw err;
    }
})

.set('register', async (req: Request, res: Response) =>
{
    env.passportManager.register(req, res, 
    {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });
})

.set('login', (req : Request, res: Response, next: any) => 
{
    // on utiliser le middleware de passport

    env.passportManager.Passport.authenticate('local', 
    function(err: any, user?: any, options?: any) 
    {
        if(options && options.message)
        {
            env.logger.note(`Connection try message : ${options.message}`);
        }

        if (err) 
        { 
            return next(err);
        }
        if (!user) 
        { 
            return res.send(statusError({message: options.message})); 
        }
        
        req.logIn(user, function(err) 
        {
            if (err) 
            { 
                env.logger.error(`Login error : ${err}`);
                return next(err); 
            }
            
            env.logger.info(`user ${user.username} successfully login`);
            return res.send(statusOK({message: `you are login`}));
        });

    })
    (req, res, next);
})

.set('logout', (req: any, res: Response) =>
{
    try
    {
        env.logger.info(`user ${req.user.username} trying to logout`)
        
        req.logOut();
        res.send(statusOK({ message:"successfully logout" }));
        
        env.logger.info(`Success`);
    }
    catch(err)
    {
        env.logger.error(`logout error : ${err}`);
        res.status(500).send(statusError({ message: `Internal Server Error can't logout`}));
    }
})

.set('createRoom', (req: Request, res: Response) =>
{
    // /!\ ANTOINE j'ai changer la method pour createRoom en POST donc on utiliser req.body au lieu de req.querry pour recup les données de la requette

    try
    {
        const UID = req.body.UID as string;

        if (typeof UID === "undefined")
        {
            res.status(500).send(statusError({message: "Can't retrieve UID GET param"}));
            throw new Error("Can't retrieve UID GET param");
        }
        env.roomsManager.create(getSandboxUID(UID));

        // @TODO gère les erreurs immédiates, mais pas celles liées au chargement de la room
        res.send(statusOK({UID: UID}));
    }
    catch (error)
    {
        env.logger.error(`room creation error : ${error.message}`)
        res.status(500).send(statusError({message: error.message}));
    }
})


.set('getRoomPublicData', (req: Request, res: Response) =>
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
})

.set('getModResource', async(req: Request, res: Response) =>
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
})

.set("getUserData", (req : any, res : Response) => 
{
    if(req.isAuthenticated())
    {
        const user = env.passportManager.getUserByID(req.user?.id);

        res.send(statusOK({
            userData: user?.publicData,
            message: "successfully sent userData"
        }));
        env.logger.info("successfully sent userData");
    }
    else
    {
        res.send(statusError({ message: `can't send user data your not logged in` }));
    }
})

.set("getModClientClass", (req: Request, res: Response) : void =>
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
});

export default handlersDefinitions;