import express from "express"
import config from "./../../configs/config.json"
import session from "express-session"
import Api from "../../types/api"
const MySQLStore = require("express-mysql-session")(session)
const sessionStore = new MySQLStore(config.DB)
const router = express()

router.use(session({
    secret: config.sessionSercet,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

router.use(express.json())

const rooms: Api.Rooms[] = []

router.post("/create", async (req, res) => {
    if (!req.session.passport) return res.status(403).send({code: 403})
    const userId = req.session.passport.user
    const { title } = req.body.data
    rooms.push({
        title: title,
        user: userId
    })
    return res.status(200).json({
        success:true,
        redirectUrl: `/room/${rooms.length - 1}`
    })
})

router.get("/:rid/data", async (req, res) => {
    const rid = parseInt(req.params.rid)
    if (rid >= rooms.length) return res.status(404).send({code: 404})
    if (rooms[rid].user !== req.session.passport?.user) return res.status(403).send({code: 403})
    return res.send(rooms[rid])
})


export default router