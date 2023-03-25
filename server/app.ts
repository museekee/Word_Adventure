import express from "express"
import session from "express-session"
import loginRouter from "./routers/login"
import apiRouter from "./routers/api"
import config from "./configs/config.json"
import { GetUser, LoginedBySession } from "./libs/DB"
const MySQLStore = require("express-mysql-session")(session)
const sessionStore = new MySQLStore(config.DB)
const app = express()
import socketio from "socket.io"
import lobbySocket from "./sockets/lobby"

app.use('/login', loginRouter)
app.use('/api', apiRouter)
app.use(session({
    secret: config.sessionSercet,
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}))

const server = app.listen(3840)

const io = new socketio.Server(server)
io.on("connection", async (defsocket) => {
    const sessid = defsocket.handshake.query["session"]
    if (!sessid) return
    const isLogined = await LoginedBySession(sessid.toString())
    if (!isLogined) return
    defsocket.join("lobby")
    lobbySocket(defsocket)
})