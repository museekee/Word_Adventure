import express from "express"
import wsModule from "ws"
import config from "@lib/config.json"
import * as NLog from "@lib/NyLog"
import * as DB from "@lib/db"
import Auth from "@lib/types/auth"
import session from "express-session"
const MySQLStore = require("express-mysql-session")(session)

const router = express.Router()
const sessionStore = new MySQLStore({}, DB.pool)
router.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))
router.use((req, res, next) => {
    const sess: Auth.Session = req.session
    res.locals.session = sess
    next()
})
router.get("/:roomId", async (req, res) => {
    const room = await DB.getRoomById(req.params.roomId)
    if (!room) return res.sendStatus(404)
    if (!(req.session?.user?.id === room.PLAYER)) return res.sendStatus(403)
    return res.render("game", {
        ws: `ws://${req.get("host")}?session=${req.session.id}&roomId=${req.params.roomId}`
    })
})
router.get("/:roomId/observe", async (req, res) => {
    const room = await DB.getRoomById(req.params.roomId)
    if (!room) return res.sendStatus(404)
    if (!req.session.user) return res.sendStatus(403)
    if (!config.ADMINS.includes(req.session.user.id)) return res.sendStatus(403)
    return res.render("game", {
        ws: `ws://${req.get("host")}?session=${req.session.id}&roomId=${req.params.roomId}&observe=true`
    })
})
export = router