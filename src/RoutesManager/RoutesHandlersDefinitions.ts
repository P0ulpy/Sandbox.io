import { Request, Response } from "express";
import bcrypt from "bcrypt";

import RoutesHandlersContainer, { ExpressHandler } from "./RoutesHandlersContainer";

const handlersDefinitions = new RoutesHandlersContainer();

handlersDefinitions.set("register", async (req: Request, res: Response) =>
{
    try
    {
        const hachedPassword = await bcrypt.hash(req.body.password, 10);

        // TODO : utiliser le generateur d'id de Antoine ou gerer directement les key depuis la DB
        // TODO : verifier si l'utilisateur n'existe pas deja
        // TODO : verifier si le format de l'email est bon 

        /*this.users.push({
            id : Date.now().toString(),
            name: req.body.name,
            name: req.body.email,
            password: hachedPassword
        });

        res.redirect('/login');

        console.log(this.users);*/
    }
    catch (err)
    {
        //this.debug('error', `register error ${err}`);
        //res.status(500).send({ success : false, errorMessage: `internal error`});
    }
})

.set("login", (req: Request, res: Response) =>
{
    console.log("login");
    res.send("login");
})

.set("test", (req: Request, res: Response) =>
{
    res.end("test");
})

.set("first", (req: Request, res: Response, next: any) =>
{
    console.log("first");
    res.send("first");
    next();
})

export default handlersDefinitions;