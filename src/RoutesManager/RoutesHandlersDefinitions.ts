import env from "../Environment";

import { join } from "path";

import { Request, Response } from "express";
import RoutesHandlersContainer, { ExpressHandler } from "./RoutesHandlersContainer";

import { getSandboxUID } from "../UID";
import { Resource } from "../LoadingMod";

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
        res.status(403).send({ success: false, errorMessage: "forbidden access"});
    }
})

.set('denyAuthenticated', (req: Request, res: Response, next: any) => 
{
    if(req.isAuthenticated())
    {
        res.status(403).send({ success: false, errorMessage: "forbidden access"});
    }
    else
    {
        next();
    }
})

.set('mypanel', (req: any, res: Response) => 
{
    res.send(
        {
            user:
            {
                name: req.user.username
            },
            mods:[]
        }
    );
})

.set('home', (req: Request, res: Response) => 
{
    res.send(
        {
            home: null
        }
    );
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

// on utiliser le middleware de passport

.set('login', (req : Request, res: Response, next: any) => 
{
    console.log(req.body);

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
            return res.send({ success: false, errorMessage: options.message}); 
        }
        
        req.logIn(user, function(err) 
        {
            if (err) 
            { 
                env.logger.error(`Login error : ${err}`);
                return next(err); 
            }
            
            env.logger.info(`user ${user.name} successfully connected`)
            return res.send({ success: true, message: `you are connected`});
        });

    })
    (req, res, next);
})

.set('logout', (req: Request, res: Response) =>
{

});

function statusOK(data: any): { status: "OK", data: any }
{
    return { status: "OK", data: data };
}

function statusError(data: any): { status: "KO", data: any }
{
    return { status: "KO", data: data };
}

handlersDefinitions

.set('createRoom', (req: Request, res: Response) =>
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

.set('getRoomResource', (req: Request, res: Response) =>
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
});

export default handlersDefinitions;