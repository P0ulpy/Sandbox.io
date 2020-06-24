import { Request, Response } from "express";

import env from "../Environment";

export type ExpressHandler = (req: Request, res: Response, next?: any) => void;

// Route: string, Handlers: ExpressHandler[]
type RoutesContainer = Map<string, ExpressHandler[]>;

type AllowedHTTPMethod = "get" | "post";

/*export class RoutesHandlers
{
    private GETHandlers: RoutesContainer = new Map<string, Array<ExpressHandler>>();
    private POSTHandlers: RoutesContainer = new Map<string, Array<ExpressHandler>>();

    private addHandler(container: RoutesContainer, route: string, handler: ExpressHandler): void
    {
        if (!container.has(route))
        {
            container.set(route, new Array<ExpressHandler>());
        }
        container.get(route)?.push(handler);
    }

    private getContainerByMethod(method: AllowedHTTPMethod): RoutesContainer | void
    {
        if (method === "get")
        {
            return this.GETHandlers;
        }
        else if (method === "post")
        {
            return this.POSTHandlers;
        }
        env.logger.warning(`RoutesHandlers : Try to access Routes of forbidden HTTP method ${method}`);
    }

    public add(method: AllowedHTTPMethod, route: string, handler: ExpressHandler): this
    {
        const routesContainer = this.getContainerByMethod(method);

        if (routesContainer)
        {
            this.addHandler(routesContainer, route, handler);
        }
    
        return this;
    }

    // Retourne undefined si le tableau n'existe pas ou s'il est vide : aucune route enregistrée
    private getHandlers(method: AllowedHTTPMethod, route: string): ExpressHandler[] | void
    {
        const routesContainer = this.getContainerByMethod(method);

        if (routesContainer)
        {
            const handlers: ExpressHandler[] | undefined = routesContainer?.get(route);
            
            if (handlers && handlers.length > 0)
            {
                return handlers;
            }
        }
    }

    public get(route: string): ExpressHandler[] | void
    {
        return this.getHandlers("get", route);
    }

    public post(route: string): ExpressHandler[] | void
    {
        return this.getHandlers("post", route);
    }
}

const routesHandlers = new RoutesHandlers();

routesHandlers.add("get", )

export default routesHandlers;*/

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