import { Request, Response } from "express";

import env from "../Environment";

export type ExpressHandler = (req: Request, res: Response, next?: any) => void;

type RoutesContainer = Map<string, ExpressHandler[]>;
type AllowedHTTPMethod = "get" | "post";

export default class RoutesHandlersContainer
{
    // Nom du handler: string, Handler: ExpressHandler
    private readonly handlers: Map<string, ExpressHandler> = new Map<string, ExpressHandler>();

    public set(name: string, handler: ExpressHandler): this
    {
        if (this.handlers.has(name))
        {
            env.logger.warning(`Overriding \`${name}\` handler`);
        }
        this.handlers.set(name, handler);
        return this;
    }

    public get(name: string): ExpressHandler | void
    {
        return this.handlers.get(name);
    }
}


/*export default class RoutesFunctions
{*/
    /*constructor()
    {
        // TODO : TEMPORAIRE

        this.users = 
        [
            {
                id: '1592865086647',
                name: 'admin@admin',
                password: '$2b$10$6fcwZXN1RuyIH6N.1tKc.OD00vOPD4UKcZWuk6JdOCuiXrKxNGXzq'
            }
        ];
    }*/

    /*static async register(req, res)
    {
        try
        {
            const hachedPassword = await bcrypt.hash(req.body.password, 10);

            // TODO : utiliser le generateur d'id de Antoine ou gerer directement les key depuis la DB
            // TODO : verifier si l'utilisateur n'existe pas deja
            // TODO : verifier si le format de l'email est bon 

            this.users.push({
                id : Date.now().toString(),
                name: req.body.name,
                name: req.body.email,
                password: hachedPassword
            });

            res.redirect('/login');

            console.log(this.users);
        }
        catch (err)
        {
            this.debug('error', `register error ${err}`);
            res.status(500).send({ success : false, errorMessage: `internal error`});
        }
    }*/

    /*static login(req, res)
    {
        console.log(req.body);
    }*/
//}