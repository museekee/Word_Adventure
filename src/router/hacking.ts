import express from "express"
import session from "express-session"
import config from "@lib/config.json"
import * as DB from "@lib/db"
import DBType from "@lib/types/db"
const MySQLStore = require("express-mysql-session")(session)

const sessionStore = new MySQLStore({}, DB.pool)
const router = express.Router()
router.use(express.json())
router.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))
router.use((req, res, next) => {
    const sess = req.session
    res.locals.session = sess
    if (sess.user && config.ADMINS.includes(sess.user.id)) next()
    else res.sendStatus(404)
})
router.post("*", async (req, res, next) => {
    if (!req.body.key || req.body.key !== config.HACKING_PASS)
        return res.sendStatus(403)
    next()
})

router.get("/", async (req, res) => {
    res.render("hacking")
})

router.post("/user/:nick", async (req, res) => {
    const user: {PW?: string} = await DB.getUserById(req.params.nick)
    if (!user) return res.sendStatus(404)
    delete user.PW
    return res.send(user)
})
export = router