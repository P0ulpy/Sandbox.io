import env from "../Environment";

import passportLocal  from "passport-local";
import expressFlash  from "express-flash";
import session from "express-session";
import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { setMaxListeners } from "process";

const passport = require("passport");
const express = require("express")

const LocalStrategy = passportLocal.Strategy;

export class User
{
    public id: string;
    public username: string;
    public email: string;
    public password: string;

    constructor(config : any)
    {
        this.id = config?.id;
        this.username = config?.username;
        this.email = config?.email;
        this.password = config?.password;
    }

    public get publicData() 
    {
        return {
            id: this.id,
            username: this.username,
            email: this.email
        };
    }
}

const bcryptLevel = 10;

export class PassportManager
{
    //TODO temporaire le temps d'avoir une BDD

    public Passport: any = passport;

    public users: User[] =
    [
        new User({
            id: '1592865086647',
            username: 'admin',
            email: 'admin@admin',
            password: '$2b$10$6fcwZXN1RuyIH6N.1tKc.OD00vOPD4UKcZWuk6JdOCuiXrKxNGXzq'
        })
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
                env.logger.error('PassportManager : No user with that email');
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
                    env.logger.error('PassportManager : Password incorrect');
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

    public async register(req: Request, res: Response, data: any)
    {
        try
        {
            const hachedPassword = await bcrypt.hash(data.password, bcryptLevel);

            // TODO : verifier si l'utilisateur n'existe pas deja
            // TODO : verifier si le format de l'email est bon 

            // TODO : TEMPORAIRE
 
            env.passportManager.users.push(new User({
                id : Date.now().toString(),
                username: data.username,
                email: data.email,
                password: hachedPassword
            }));

            res.send({status: "OK", data: { message: "Successfuly registered" }})
            
            console.log(this.users);
        }
        catch (err)
        {
            res.status(500).send({status: "KO", data: { message: "internal error" }});
            env.logger.error(`register error : ${err}`);
            throw err;
        }
    }

    public updateUsername(id: string, newusername: string) : void
    {
        const user: User | undefined = this.getUserByID(id);

        if(user)
        {
            user.username = newusername;
        }
        else
        {
            env.logger.error(`can't update username invalid id (${id})`);
        }
    }

    public updateEmail(id: string, newEmail: string) : void
    {
        const user: User | undefined = this.getUserByID(id);

        if(user)
        {
            user.email = newEmail;
        }
        else
        {
            env.logger.error(`can't update email invalid id (${id})`);
        }
    }

    public async updatePassword(id: string, newPassword: string)
    {
        const newHachedPassword = await bcrypt.hash(newPassword, bcryptLevel);

        const user: User | undefined = this.getUserByID(id);

        if(user)
        {
            user.password = newHachedPassword;
        }
        else
        {
            env.logger.error(`can't update password invalid id (${id})`);
        }
    }

    public getUserByEmail(email: string): User | undefined
    {
        return this.users.find(user => user.email === email);
    }

    public getUserByID(id: string): User | undefined
    {
        return this.users.find(user => user.id === id);
    }
}