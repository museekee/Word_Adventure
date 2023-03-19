import express from "express"
import config from "./../configs/config.json"
import auth from "./../configs/auth.json"
import session from "express-session"
const MySQLStore = require("express-mysql-session")(session)
import passport from "passport"
import passportGoogle from "passport-google-oauth2"
import cors from 'cors'
import { PushUser } from "../libs/DB"
const GoogleStrategy = passportGoogle.Strategy

const router = express.Router()

const sessionStore = new MySQLStore(config.DB)

router.use(session({
    secret: config.sessionSercet,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))
router.use(cors({origin: "http://localhost:3000", credentials:true}));
router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser(async (user: any, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id: any, done) => {
    done(null, id);
})

passport.use(
    new GoogleStrategy(
        {
            clientID: auth.google.id,
            clientSecret: auth.google.secret,
            callbackURL: "http://localhost:3000/login/google/callback",
            passReqToCallback: true,
        },
        async (request: any, accessToken: any, refreshToken: any, profile: any, done: (arg0: null, arg1: any) => any) => {
            await PushUser({
                id: profile.id,
                nick: profile.displayName,
                email: profile.email,
                pfp: profile.picture,
                provider: profile.provider
            })

            return done(null, profile);
        }
    )
)
router.get("/google/callback", passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
}))
router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
)
router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/")
    })
})
export default router