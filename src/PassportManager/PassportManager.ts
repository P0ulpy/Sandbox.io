import env from "../Environment";

import passportLocal  from "passport-local";
import expressFlash  from "express-flash";
import session from "express-session";
import { Response, Request } from "express";
import bcrypt from "bcrypt";

const passport = require("passport");
const express = require("express")

const LocalStrategy = passportLocal.Strategy;

type RegisterData = 
{
    username: string, 
    email: string, 
    password: string
}

export default class PassportManager
{
    //TODO temporaire le temps d'avoir une BDD

    public Passport: any = passport;

    public users: any[] =
    [
        {
            id: '1592865086647',
            username: 'admin',
            email: 'admin@admin',
            password: '$2b$10$6fcwZXN1RuyIH6N.1tKc.OD00vOPD4UKcZWuk6JdOCuiXrKxNGXzq'
        }
    ]

    constructor()
    {
        env.app.use(express.urlencoded({ extended: false }));
        env.app.use(expressFlash());

        env.app.use(session({
            secret: 'secret',   //TODO : faire un vrais secret
            resave: false,
            saveUninitialized: false
        }));

        env.app.use(passport.initialize());
        env.app.use(passport.session());

        this.initStrategy();
    }

    private initStrategy()
    {
        passport.serializeUser((user: any, done: any) => done(null, user.id));
        passport.deserializeUser((id: string, done: any) => done(null, this.getUserByID(id)));

        passport.use(new LocalStrategy({ usernameField: 'email' }, async(email, password, done) => 
        {
            const user = this.getUserByEmail(email);

            if(user == null)    
            {
                env.logger.error('No user with that email');
                return done(null, false, { message : 'No user with that email' });
            }
            
            try
            {
                if(await bcrypt.compare(password, user.password))
                {
                    return done(null, user);
                }
                else
                {
                    env.logger.error('Password incorrect');
                    return done(null, false, { message : 'Password incorrect' });
                }
            }
            catch(err)
            {
                return done(err);
            }
        }));

        env.logger.info(`Successfully initilialized PassportManager`);
    }

    public async register(req: Request, res: Response, data: RegisterData)
    {
        try
        {
            const hachedPassword = await bcrypt.hash(passport, 10);

            // TODO : verifier si l'utilisateur n'existe pas deja
            // TODO : verifier si le format de l'email est bon 

            // TODO : TEMPORAIRE

            env.passportManager.users.push(
            {
                id : Date.now().toString(),
                username: data.username,
                email: data.email,
                password: hachedPassword
            });

            res.send({success: true, message: "Successfuly registered"})
            
            console.log(this.users);
        }
        catch (err)
        {
            env.logger.error(`register error ${err}`);
            res.status(500).send({ success : false, errorMessage: `internal error`});
        }
    }

    private getUserByEmail(email: string): any
    {
        return this.users.find(user => user.email === email);
    }

    private getUserByID(id: string): any
    {
        return this.users.find(user => user.id === id);
    }
}