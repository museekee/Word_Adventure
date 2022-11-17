import express from "express"
import config from "@lib/config.json"
import path from "path"
import * as NLog from "@lib/NyLog"
import * as DB from "@lib/db"
import session from "express-session"
const MySQLStore = require("express-mysql-session")(session)
import Auth from "@lib/types/auth"
import socketio from "socket.io"
import { SessionSocket } from "@lib/types/app"
import appSocket from "sockets/app.socket"

const app = express()
const sessionStore = new MySQLStore({}, DB.pool)
const mySession = session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
})
app.use(mySession)
app.use((req, res, next) => {
    const sess: Auth.Session = req.session
    res.locals.session = sess
    next()
})
app.set("view engine", "pug")
app.set("views",  path.join(__dirname, "views"))
app.use(express.json())
app.use("/assets", express.static(path.join(__dirname, "assets")))
app.use("/favicon.ico", express.static(path.join(__dirname, "assets/images/favicon.ico")))
app.use("/g", require("@router/game"))
app.use("/account", require("@router/auth"))

app.get("/", async (req, res) => {
    const sess = req.session
    const user = {
        exp: 0,
        money: 0,
        item: {}
    }
    if (sess.user) {
        const dbUser = await DB.getUserById(sess.user.id)
        user.exp = dbUser.EXP
        user.money = dbUser.MONEY
    }
    res.render("main", {
        categories: await DB.getCategories(),
        user,
        sessionId: req.session.id
    })
})
app.get("/ziu/:itemId", async (req, res) => {
    const item = await DB.getShopItemById(req.params.itemId)
    return res.sendFile(path.join(__dirname, `/assets/images/ziu/${item.CATEGORY}/${item.ID}.${item.IMG_TYPE}`))
})

const server = app.listen(config.PORT, () => {
    NLog.Success(`Express server launched on ${config.PORT}`)
})
const io = new socketio.Server(server)
io.on("connection", async (defsocket) => {
    const socket = <SessionSocket> defsocket
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address
    NLog.Log("Connect lobby server", { ip: ip })
    appSocket(socket)
})