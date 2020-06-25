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

import env from "../Environment";

import { readFile } from "fs/promises";
import { IRouterMatcher } from "express";

import { EventEmitter } from "events";
import handlersDefinitions from "./RoutesHandlersDefinitions";

import express from "express";

type Route = {
    route: string;
    handlers: string[]
}

class RoutesManagerError extends Error {}

function isHTTPMethodAllowed(method: string): boolean
{
    const allowedHTTPMethods = [ "get", "post" ];

    return allowedHTTPMethods.includes(method);
}

type RoutesDefinitions = {
    [ HTTPmethod: string ]: Route[]
}

/*const addHandlerMethods: Map<string, IRouterMatcher<Express.Application>> = new Map([
    [ "get", env.app.get ],
    [ "post", env.app.post ]
]);*/

export default class RoutesManager extends EventEmitter
{
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
            // TODO pas de vérif, on part du principe que le format est bon
            return JSON.parse(JSONData);
        }
        catch (error)
        {
            this.endWithError(error);
        }
    }

    private async loadRoutesDefinition(): Promise<void>
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

    private applyRoutesDefinitions(definitions: RoutesDefinitions): void
    {
        for (const method in definitions)
        {
            if (isHTTPMethodAllowed(method))
            {
                // Liste des routes à attacher
                const routes: Route[] = definitions[method];
                this.attachHandlers(method, routes);
            }
            else
            {
                env.logger.warning(`Trying to add handlers on forbidden HTTP method ${method}`);
            }
        }
    }

    //private getHandlersDefinitions()

    private attachHandlers(method: string, routes: Route[]): void
    {
        for (const r of routes)
        {
            // Chemin de la route : "/", "/test/:id", etc.
            const route = r.route;
            // Noms des handlers à appliquer : "getHomePage", etc.
            const handlersNames = r.handlers;
            
            if(typeof(handlersNames) != typeof([""]))
            {
                env.logger.error(`invalid handlersNames for ${r.route}`);
                return;
            }

            // @TODO attention, applique chaque handler 1 à 1. Bonne idée ?
            for (const name of handlersNames)
            {
                // Récupère la définition (fonction) du nom du handler
                const handler = handlersDefinitions.get(name);

                if (!handler)
                {
                    //const error = new RoutesManagerError(`Can't find definition of handler ${name}`);
                    //env.logger.error(error);
                    //throw error;
                    env.logger.warning(`Can't find definition of handler ${name}`);
                }
                else
                {
                    if (method === "get")
                    {
                        env.logger.info(`Successfully added handler ${name} on HTTP method ${method}`);
                        env.app.get(route, handler);
                    }
                    else if (method === "post")
                    {
                        env.logger.info(`Successfully added handler ${name} on HTTP method ${method}`);
                        env.app.post(route, handler);
                    }
                    else
                    {
                        env.logger.warning(`Try to add handler on forbidden HTTP method ${method}`);
                    }
                }

                //getHandlersDefinitions ??
            }
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