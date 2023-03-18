import express from "express"
import config from "./../configs/config.json"
import auth from "./../configs/auth.json"
import session from "express-session"
const MySQLStore = require("express-mysql-session")(session)
import passport from "passport"
import passportGoogle from "passport-google-oauth2"
import cors from 'cors'
const GoogleStrategy = passportGoogle.Strategy

const router = express.Router()

const sessionStore = new MySQLStore(config.DB)

router.use(
    session({
        secret: auth.google.secret,
        store: sessionStore,
        resave: false,
        saveUninitialized: false
    })
)
router.use(cors({origin: "http://localhost:3000", credentials:true}));
router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser((user: any, done) => {
    done(null, user.id);
    console.log("serialize", user)
})

passport.deserializeUser((id: any, done) => {
    done(null, id);
    console.log("deserialize", id)
})

passport.use(
    new GoogleStrategy(
        {
            clientID: auth.google.id,
            clientSecret: auth.google.secret,
            callbackURL: "http://localhost:3000/login/google/callback",
            passReqToCallback: true,
        },
        function (request: any, accessToken: any, refreshToken: any, profile: any, done: (arg0: null, arg1: any) => any) {
            console.log(profile);
            console.log(accessToken);

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
    req.session.destroy((err) => {
        if (err) {
            console.log(`dd" ${err}`)
            return res.sendStatus(500)
        }
        else return res.sendStatus(200)
    });
    res.redirect("/login");
})
export default router