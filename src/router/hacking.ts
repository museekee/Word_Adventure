import express from "express"
import session from "express-session"
import config from "@lib/config.json"
import * as DB from "@lib/db"
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
    res.render("hacking", {
        categories: await DB.getCategories()
    })
})

router.post("/user/:id", async (req, res) => {
    const user: {PW?: string} = await DB.getUserById(req.params.id)
    if (!user) return res.sendStatus(404)
    delete user.PW
    return res.send(user)
})
router.post("/user/:id/apply", async (req, res) => {
    const { id, nick, exp, money, item, equip, ban } = req.body.data
    await DB.updateUser(req.params.id, id, nick, exp, money, item, equip, ban)
    return res.send({code: 200})
})

router.post("/category/create", async (req, res) => {
    const { id, name, description } = req.body.data
    await DB.createCategory(id, name, description)
    return res.send({code: 200})
})

router.post("/word", async (req, res) => {
    const { category, start, limit }: {category: string, start: number, limit: number} = req.body.data
    if (start <= 0 || limit <= 0) return res.sendStatus(403)
    return res.send(await DB.getWordsByCategoryId(category, start, limit))
})
router.post("/word/apply", async (req, res) => {
    const { category, words }: {category: string, words: string[]} = req.body.data
    await DB.setWordsByCategoryId(category, words)
    return res.send({code: 200})
})

router.post("/room", async (req, res) => {
    return res.send(await DB.getRooms())
})
export = router