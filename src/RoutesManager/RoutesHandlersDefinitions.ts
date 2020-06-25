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
            env.logger.note(`connection message : ${options.message}`);
        }

        if (err) 
        { 
            return next(err); 
        }
        if (!user) 
        { 
            return res.send('pas ouf le mdp/email la'); 
        }
        
        req.logIn(user, function(err) 
        {
            if (err) 
            { 
                return next(err); 
            }
            
            return res.send('putain truc de ouf t est co');
        });

    })
    (req, res, next);
})

.set('logout', (req: Request, res: Response) =>
{

})

export default handlersDefinitions;