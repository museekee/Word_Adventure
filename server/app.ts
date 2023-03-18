import express from "express"
import session from "express-session"
import loginRouter from "./routers/login"
import config from "./configs/config.json"
import { GetUser } from "./libs/DB"
const MySQLStore = require("express-mysql-session")(session)
const sessionStore = new MySQLStore(config.DB)
const app = express()

app.use('/login', loginRouter);
app.use(session({
    secret: config.sessionSercet,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

app.get("/myData", async (req, res) => {
    //@ts-ignore
    if (!req.session.passport) return res.status(404).send({code: 404})
    //@ts-ignore
    const userId = req.session.passport.user
    if (userId) {
        const user = await GetUser(userId)
        console.log(user)
        if (!user) return res.status(404).send({code: 404})
        return res.send({
            id: user.ID,
            nick: user.NICK,
            pfp: user.PFP,
        })
    }
    return res.status(404).send({code: 404})
})

app.listen(3840)