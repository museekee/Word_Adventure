import express from "express"
import config from "./../configs/config.json"
import session from "express-session"
import { GetUser } from "../libs/DB"
const MySQLStore = require("express-mysql-session")(session)
const sessionStore = new MySQLStore(config.DB)
import app from "./../types/app"
import roomsRouter from "./api/rooms"

const router = express()

router.use(session({
    secret: config.sessionSercet,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

router.use(express.json())

router.use("/rooms", roomsRouter)

router.get("/myData", async (req, res) => {
    console.log(req.session.passport?.user)
    if (!req.session.passport) return res.status(404).send({code: 404})
    const userId = req.session.passport.user
    if (userId) {
        const user = await GetUser(userId)
        console.log(user)
        if (!user) return res.status(404).send({code: 404})
        return res.send({
            id: user.ID,
            nick: user.NICK,
            pfp: user.PFP,
            sessId: req.session.id
        })
    }
    return res.status(404).send({code: 404})
})

export default router