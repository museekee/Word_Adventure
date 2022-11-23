import express from "express"
import session from "express-session"
import config from "@lib/config.json"
import * as DB from "@lib/db"
const MySQLStore = require("express-mysql-session")(session)

const sessionStore = new MySQLStore({}, DB.pool)
const router = express.Router()
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

router.get("/", async (req, res) => {
    res.render("hacking")
})
export = router