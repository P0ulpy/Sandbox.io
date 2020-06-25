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
import { IRouterMatcher } from "express";

import env from "../Environment";
import { EventEmitter } from "events";
import handlersDefinitions from "./RoutesHandlersDefinitions";

type Route = {
    route: string;
    handlers: string[]
}
8
class RoutesManagerError extends Error {}

function isHTTPMethodAllowed(method: string): boolean
{
    const allowedHTTPMethods = [ "get", "post" ];

    return allowedHTTPMethods.includes(method);
}

type RoutesDefinitions = {
    [ HTTPmethod: string ]: Route[]
}

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
            // @TODO pas de vérif, on part du principe que le format est bon
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

    private attachHandlers(method: string, routes: Route[]): void
    {
        for (const r of routes)
        {
            // Chemin de la route : "/", "/test/:id", etc.
            const route = r.route;
            // Noms des handlers à appliquer : "getHomePage", etc.
            const handlersNames = r.handlers;
            
            // @TODO attention, applique chaque handler 1 à 1. Bonne idée ?
            for (const name of handlersNames)
            {
                // Récupère la définition (fonction) du nom du handler
                const handler = handlersDefinitions.get(name);

                if (!handler)
                {
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
            }
        }
    }
}