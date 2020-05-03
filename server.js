if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}


const path = require("path");
const socket = require("socket.io");
const http = require("http");

const SandboxLibrary = require("./server/lib");
const ModLoader = SandboxLibrary.constructors.ModLoader;
const UIDManager = SandboxLibrary.constructors.UIDManager;
const RoomLoader = SandboxLibrary.constructors.RoomLoader;
const RoomsManager = SandboxLibrary.constructors.RoomsManager;




const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const server = http.createServer(app);


// Déplacer tout ça dans un endroit adapté : config.js ou init.js
SandboxLibrary.env.set("httpServer", server);
SandboxLibrary.env.set("app", app);
SandboxLibrary.env.set("socketIO", socket(server));
SandboxLibrary.env.set("sandboxPath", path.join(__dirname, "server/Sandboxes/"));
SandboxLibrary.env.set("modPath", path.join(__dirname, "server/Mods/"));
SandboxLibrary.env.set("roomsManager", new RoomsManager());
SandboxLibrary.env.set("UIDManager", new UIDManager());
SandboxLibrary.env.set("debugLevel", "note");
SandboxLibrary.env.set("modLoader", new ModLoader());
SandboxLibrary.env.set("roomLoader", new RoomLoader());

app.use(express.static(path.join(__dirname + '/client')));

// permet de generer un acces au variables d'un POST dans req.body 
app.use(express.urlencoded({ extended: false }));
app.set('view-engine', 'ejs');

/* BEGINNING OF DEGUEULASSE CODE */
function basicIterator()
{
    const next = this.get("lastValue") + 1;

    this.persist("lastValue", next);

    return ("00" + next).slice(-3);
};

function checkValidity(uniqueID)
{
    // Chaîne de caractère qui représente un nombre allant de 000 à 999
    return /^[0-9]{3}$/.test(uniqueID);
}

// Création de générateurs d'UID : 1 pour les sandboxes, 1 pour les mods
SandboxLibrary.env.get("UIDManager")
.create("sandbox", basicIterator, checkValidity, { lastValue: 0 })
.create("mod", basicIterator, checkValidity, { lastValue: 0 });
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('joining.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)