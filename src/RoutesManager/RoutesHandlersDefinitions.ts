import env from "../Environment";

import { Request, Response } from "express";
import bcrypt from "bcrypt";

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


.set('login', (req: Request, res: Response, next: any) =>
{
    // on utiliser le middleware de passport

    env.passportManager.passport.authenticate('local', 
    {
        successRedirect: '/mypanel',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
})

.set('logout', (req: Request, res: Response) =>
{

})


export default handlersDefinitions;