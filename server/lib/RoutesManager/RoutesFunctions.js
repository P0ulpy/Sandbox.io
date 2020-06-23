const path = require('path');
const express = require('express');
const LibraryComponent = require('../LibraryComponent');


/* CODE (dégeu) TEMPORAIRE LE TEMPS DE MERGE*/
 
const passport = require('passport');
const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const expressFlash = require('express-flash');
const session = require('express-session');

const users = 
[
    {
        id: '1592865086647',
        username: 'admin',
        email: 'admin@admin',
        password: '$2b$10$6fcwZXN1RuyIH6N.1tKc.OD00vOPD4UKcZWuk6JdOCuiXrKxNGXzq'
    }
];

function getUserByEmail(email)
{
    return users.find(user => user.email === email);
}

function getUserByID(id)
{
    return users.find(user => user.id === id);
}

function initPassport(app)
{
    app.use(expressFlash());
        
    app.use(session({
        secret: 'secret',   // TODO : faire un vrais secret random
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // la fonction sert de verification d'autentification
    passport.use(new localStrategy({ usernameField: 'email' }, async(email, password, done) => 
    {
        const user = getUserByEmail(email);

        if(user == null)    
        {
            return done(null, false, { message : 'No user with that email'});
        }

        try 
        {
            if(await bcrypt.compare(password, user.password))
            {
                return done(null, user);
            }
            else
            {
                return done(null, false, { message : 'Password incorrect' });
            }
        }
        catch(err)
        {
            return done(err);
        }       
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => done(null, getUserByID(id)));
}

/*FIN DU CODE TEMPORAIRE LE TEMPS DE MERGE*/

class RoutesFunctions extends LibraryComponent
{
    constructor()
    {
        super();
        
        // reference au RoomManager
        this.RM = this.env.get('RoomsManager');
        
        initPassport(this.env.get('app'));
    }

    getHomePage(req, res)
    {
        res.render('home.ejs');
    }

    getLoginPage(req, res)
    {
        res.render('login.ejs');
    }

    getRegisterPage(req, res, next)
    {
        res.render('register.ejs');
    }

    getMypanelPage(req, res)
    {
        res.render('panel.ejs', 
        {
            userData: 
            {
                name: req.user.username
            }
        });
    }

    getMypanel(req, res)
    {
        res.send(
            {
                userData: 
                {
                    name: req.user.name
                } 
            }
        );
    }

    checkAuthenticated(req, res, next)
    {
        if(req.isAuthenticated())
        {
            return next();
        }

        res.redirect('/login');
    }

    checkNotAuthenticated(req, res, next)
    {
        if(req.isAuthenticated())
        {
            res.redirect('/mypanel');
        }
        else
        {
            next();
        }
    }

    async register(req, res)
    {
        try
        {
            const hachedPassword = await bcrypt.hash(req.body.password, 10);

            // TODO : verifier si l'utilisateur n'existe pas deja
            // TODO : verifier si le format de l'email est bon 

            // TODO : TEMPORAIRE

            users.push({
                id : Date.now().toString(),
                username: req.body.username,
                email: req.body.email,
                password: hachedPassword
            });

            res.redirect('/login');

            console.log(users);
        }
        catch (err)
        {
            this.debug('error', `register error ${err}`);
            res.status(500).send({ success : false, errorMessage: `internal error`});
        }
    }

    login(req, res, next)
    {
        // on utiliser le middleware de passport

        passport.authenticate('local', 
        {
            successRedirect: '/mypanel',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    }

    logout(req, res)
    {
        req.logOut();
        res.redirect('/login');
    }



















    /*getRoom(req, res)
    {
        const UID = req.query.UID;
        
        if(this.RM.has(UID))
        {
            res.render('room.ejs', this.RM.get(UID).data);
        }
        else
        {
            this.debug("error", `can't get room : invalid UID (${UID})`);
            res.status(500).send({ success : false, errorMessage: `can't get room : invalid UID`, UID:UID});
        }
    }

    createRoom(req, res)
    {
        const UID = this.env.get("UIDManager").get("sandbox").nextValue();

        if(!this.RM.has(UID))
        {
            const config = {
                UID: UID,
                name: `SDB#${UID}`,
                MOTD: `Welcome to #${UID}`,
                mods: [ "001", "002", "004", "0088" ],
                updateRate: 1000,
                size: 5
            };
            
            const room = new this.constructors.Room(config);
            this.RM.add(room);

            //redirige l'utilisateur vers /room?UID='UID'
            res.redirect(url.format({
                pathname:'/room',
                query : {"UID": UID}
            }));
        }
        else
        {
            this.debug("error", `can't create room : Duplicated UID (${UID})`);
            res.status(500).send({ success : false, errorMessage: `can't create room`});
        }
    }

    sendClientMod(req, res)
    {
        // Pour l'instant, on se contente d'envoyer le fichier client.js en brut
        const modUID = req.params.UID;
        const modLoader = this.env.get("ModLoader");

        modLoader.getModconfig(modUID).then(modConfig =>
        {
            this.debug("note", `Sending client class for mod #${modUID}`);
            res.sendFile(modConfig.clientClassPath);
        })
        .catch(error =>
        {
            this.debug("error", `Can't send mod code : ${error}`);
            res.status(500).send({ success: false, errorMessage: error });
        });
    }

    sendSandboxInfos(req, res)
    {
        const UID = req.params.UID;
        const UIDManager = this.env.get("UIDManager");

        if (UIDManager.get("sandbox").isValid(UID))
        {
            this.env.get("SandboxLoader").getPublicInfos(UID).then(data =>
            {
                res.send(data);
            })
            .catch((err) =>
            {
                this.debug("error", err);
                res.status(500).send({ status: false, errorMessage: "Internal error", errorData: { UID: UID } });
            });
        }
        else
        {
            res.status(500).send({ status: false, errorMessage: "Invalid Sandbox UID", errorData: { UID: UID } });
        }
    }*/
}

module.exports = new RoutesFunctions();