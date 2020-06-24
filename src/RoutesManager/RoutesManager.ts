/*
le fonctionement du RouteManager est en 3 temps :

- la première partie c'est routes.json qui en somme contien toutes les informations nécéssaire a faire la liaison 
entre method (GET / POST) route ("/", "/home", ect...) et functions la premère etapes lorque l'on ajoute une route
c'est de remplir routes.json

- la deuxième partie de ce RouteManager c'est RoutesFunctions qui en soit est le fichier le plus simple 
c'est simplement un obj qui contient des functions, lorsque l'on veut rajouter une route c'est dans 
RoutesFunction.js que l'on vas rajouter le/les function(s) nécessaire au fonctionnement de la route 

- la dernière partie et le coeur du système c'est ce fichier RouteManager.js qui permet de géré
l'ajout de toutes les routes a une method (POST/GET) et les functions associer au routes, 
il permet aussi de géré les routes static et toutes les initialisations de app

voila vous etes complement armé pour utiliser RouteManager have fun

*/

import { readFile } from "fs/promises";
import path from "path";
import express, { Request, Response } from "express";

import env from "../Environment";
import RoutesFunctions = require("./RoutesFunctions");
import { EventEmitter } from "events";

const allowedHTTPMethods = [ "get", "post" ];

function isHTTPMethodAllowed(method: string): boolean
{
    return (allowedHTTPMethods.includes(method));
}

type RoutesDefinitions = {
    get: Route[];
    post: Route[];
}

type Route = {
    route: string;
    functions: (req: Request, res: Response, next: );
}

export default class RoutesManager extends EventEmitter
{
    private routesDefinitions: RoutesDefinitions | null = null;

    constructor()
    {
        super();

        this.loadRoutesDefinition();
    }

    private endWithError(error: Error): never
    {
        env.logger.error(`RoutesManager error : ${error.message}`);
        throw error;
    }

    private getRoutesFileContent(): Promise<string>
    {
        return readFile(env.routesDefinitionFile, "utf-8");
    }

    private JSONtoRoutesDefinitions(JSONData: string): RoutesDefinitions
    {
        try
        {
            // @TODO pas de vérif, on part du principe que le format est bon
            return JSON.parse(JSONData);
        }
        catch (error)
        {
            this.endWithError(error);
        }
    }

    private getFunctions(functionsNames: string[])
    {
        for (const functionName of functionsNames)
        {
            // @ts-ignore
            if (typeof RoutesFunctions[functionName] === "function")
            {

            }
        }
    }

    private applyRoutesDefinitions(routesDefinitions: RoutesDefinitions)
    {
        // @TODO code nul
        for (const method in routesDefinitions)
        {
            if (isHTTPMethodAllowed(method))
            {
                // @TODO nul nul nul nul nul
                const routeDefinition = routesDefinitions[method as "get" | "post"];

            }
            else
            {
                env.logger.warning(`HTTP method not allowed ${method}`);
            }
        }
    }

    private applyRoutes(method: string, routes: Route)
    {
        switch (method)
        {
            case "get":
                env.app.get(routes.route, );
        }
    }

    private async loadRoutesDefinition()
    {
        try
        {
            // Récupération du contenu du fichier
            const routesFileContent: string = await this.getRoutesFileContent();

            const routesDefinitions: RoutesDefinitions = this.JSONtoRoutesDefinitions(routesFileContent);

            this.applyRoutesDefinitions(routesDefinitions);
        }
        catch (error)
        {
            this.endWithError(error);
        }
    }
}

/*export default class RoutesManager2
{
    constructor()
    {
        this.functions = require("./RoutesFunctions.js");
        this.initApp();

        this.getRoutesFile()
        .then((routes) => 
        {   
            this.loadStatics(routes);
            this.loadRoutes('get', routes);
            this.loadRoutes('post', routes);
        })
        .catch((err) => 
        {
            throw err;
        });
    }


    loadRoutes(method = "get", routes)
    {
        this.debug("log", `chargement des routes avec la method "${method}"`);

        const _routes = routes[method]; 

        for(const route of _routes)
        {
            if(route.functions)
            {
                const functions = this.getFunctions(route.functions);

                if(functions)
                {
                    this.app[method](route.route, ...functions);
                    this.debug("note", `functions [${route.functions}] appliquer a la route "${route.route}"`);
                }
                else
                {
                    this.debug("error", `impossible d'appliquer les functions [${route.functions}] a la route "${route.route}"`);
                }
            }
            else
            {
                this.debug('error', `aucune function lié a la route ${route.route} avec la method ${method}`);
            }
        }
    }

    getFunctions(functionsNames = [""])
    {
        const methods = [];

        for(const functionName of functionsNames)
        {
            if(this.functions[functionName] && typeof(this.functions[functionName]) === 'function')
            {
                // pour que le this ne soit pas override
                methods.push((req, res, next) => { this.functions[functionName](req, res, next); });
            }
            else
            {   
                this.debug("error", `RouteManager : impossible de trouver la function "${functionName}"`);
            }
        }

        // si il n'y a pas de funtions return null
        return (methods.length > 0) ? methods : null;
    }
}*/