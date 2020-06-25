import env from "../Environment";

import { Request, Response } from "express";

import RoutesHandlersContainer, { ExpressHandler } from "./RoutesHandlersContainer";

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

})

export default handlersDefinitions;