import express from "express"
import config from "@lib/config.json"
import path from "path"
import * as NyLog from "@lib/NyLog"
import * as DB from "@lib/db"
import session from "express-session"
const MySQLStore = require("express-mysql-session")(session)
import crypto from "crypto"
import Auth from "@lib/types/auth"

const app = express()

app.set("view engine", "pug")
app.set("views",  path.join(__dirname, "views"))
app.use(express.json())
app.use("/assets", express.static(path.join(__dirname, "assets")))
app.use("/favicon.ico", express.static(path.join(__dirname, "assets/images/favicon.ico")))
app.use("/g", require("@router/game"))
const sessionStore = new MySQLStore({}, DB.pool)
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))
app.use((req, res, next) => {
    const sess: Auth.Session = req.session
    res.locals.session = sess
    console.log(sess)
    next()
})
app.use("/account", require("@router/auth"))

app.get("/", async (req, res) => {
    res.render("main", {
        categories: await DB.getCategories()
    })
})

app.post("/tryMakeGame", async (req, res) => {
    const category: string[] = []
    const sess: Auth.Session = req.session
    for (const key in req.body.category) {
        if (req.body.category[key]) category.push(key)
    }
    const option = req.body.option
    for (const key in option)
        if (!option[key]) 
            return res.status(403).send({reason: "No option"})
    if (option.round <= 0 || option.time <= 0) return res.status(403).send({reason: "Do not use minus"})
    if (category.length === 0) return res.status(403).send({reason: "No category"})
    const sha1 = crypto.createHash("sha1")
    sha1.update(`${rand(0, 999)}${category[0]}`)
    const roomId = sha1.digest("hex")
    if (!sess.isLogin) return res.status(403).send({reason: "No Login"}) 
    if (!sess.user?.id) return 
    await DB.generateRoom(roomId, category, [sess.user.id], option.round, option.time * 1000)
    return res.redirect(`/g/${roomId}`)
})

app.listen(config.PORT, () => {
    NyLog.Success(`Express server launched on ${config.PORT}`)
})

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}